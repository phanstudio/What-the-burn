from datetime import datetime
from eth_account.messages import encode_defunct
from eth_account import Account
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import viewsets, status
from django.conf import settings
from django.http import HttpResponse
from django.utils.crypto import get_random_string
from django.utils import timezone
from .permissions import HasCronSecretPermission
from .models import EthUser, ImageUrl, Update_Request, AppSettings, Lovecraft, ExpiringToken
from .serializers import (
    SignatureVerifySerializer, UpdateRequestSerializer,
    AppSettingsSerializer
)
from io import BytesIO
from web3 import Web3
import requests
import zipfile
import secrets

def index(request):
    now = datetime.now()
    html = f'''
    <html>
        <body>
            <h1>Hello from Vercel!</h1>
            <p>The current time is { now }.</p>
        </body>
    </html>
    '''
    return HttpResponse(html)

class GetSignMessageView(APIView): # cors should help with this
    permission_classes = [AllowAny]
    def get(self, request):
        wallet = request.query_params.get("wallet", "")
        user, _ = EthUser.objects.update_or_create(
            address=wallet,
            defaults={"nonce": secrets.token_hex(16)}
        )
        return Response({
            "message": f"Sign this message to authenticate: {user.nonce}"
        })

class VerifySignatureView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        serializer = SignatureVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        wallet = serializer.validated_data['wallet_address']
        signature = serializer.validated_data['signature']

        try:
            user = EthUser.objects.get(address=wallet)
        except EthUser.DoesNotExist:
            return Response({"error": "User not found"}, status=400)

        message = encode_defunct(text=f"Sign this message to authenticate: {user.nonce}")
        try:
            recovered = Account.recover_message(message, signature=signature)
        except Exception as e:
            return Response({"error": "Invalid signature"}, status=400)

        if recovered.lower() != wallet.lower():
            return Response({"error": "Signature mismatch"}, status=403)

        ExpiringToken.objects.filter(user=user).delete()
        token = ExpiringToken.objects.create(
            user=user,
            key=get_random_string(40)
        )

        # Rotate nonce
        user.nonce = secrets.token_hex(16)
        user.save(update_fields=["nonce"])

        return Response({
            "admin": user.is_staff,
            "token": token.key,
            "expires_at": token.expires_at
        })

class Gettokens(APIView): 
    permission_classes = [IsAuthenticated]
    def get(self, request):
        wallet = request.user.address.lower()
        img_url = ImageUrl.objects.get(id=1)
        tokens = self.tokens_owned(wallet, img_url.url)
        return Response({"tokens": tokens})

    def tokens_owned(self, owner_address, image_url) -> list:
        tokens = Lovecraft.objects.filter(current_owner=owner_address).values_list('token_id', flat=True)
        updated_tokens = Update_Request.objects.filter(address__iexact=owner_address).values_list('update_id', flat=True) # flag them as updated
        token_ids = []
        for token in tokens:
            is_updated = token in updated_tokens
            token_ids.append({
                "id": token,
                "image": f"{image_url}", # add .png for main build
                "name": f"What test{' (Updated)' if is_updated else ', Why test'} {token}", # change to main net eventualy
                "updated": is_updated
            })
        return token_ids

class UpdateImageUrl(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        url = request.query_params.get("url", "")
        _, _ = ImageUrl.objects.update_or_create(id=1, url=url)
    
        return Response({
            "message": f"{url} Added"
        })

class UpdateImageUrlFromIPFS(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        url = request.query_params.get("url", "")
        if url == "":
            url = self.get_token_uri(1)
        image_url = self.handel_ipfs(url)
        
        user, _ = ImageUrl.objects.update_or_create(id=1, url=image_url)
    
        return Response({
            "message": f"{url} Added"
        })

    def handel_ipfs(self, json_url:str):
        try:
            response = requests.get(json_url, timeout=5)
            response.raise_for_status()
            data = response.json()
            image_uri:str = data.get("image")
            image_uri = image_uri.split("/1.")[0]+"/"

        except Exception as e:
            self.stderr.write(f"Error fetching {json_url}: {e}")
        self.update(image_uri)

    def get_token_uri(self, token_id:int = 1)->str:
        rpc_url = settings.ETH_PROVIDER_URL
        web3 = Web3(Web3.HTTPProvider(rpc_url))
        assert web3.is_connected(), "Can't connect to HyperEVM"
        contract_address = settings.ETH_COLLECTION_CONTRACT
        abi = [
            {
                "constant": True,
                "inputs": [{"name": "tokenId","type": "uint256"}],
                "name": "tokenURI",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            }
        ]
        contract = web3.eth.contract(address=contract_address, abi=abi)
        token_uri:str = contract.functions.tokenURI(token_id).call()
        return token_uri

class CleanupExpiredTokensView(APIView):
    permission_classes = [HasCronSecretPermission]

    def post(self, request):
        try:
            count, _ = ExpiringToken.objects.filter(expires_at__lte=timezone.now()).delete()
            return Response({"deleted_tokens": count})
        except Exception as e:
            return Response({"error": f"Internal server error{e}"}, status=500)   

class UpdateRequestViewSet(viewsets.ModelViewSet):
    queryset = Update_Request.objects.all()
    serializer_class = UpdateRequestSerializer

    def get_permissions(self):
        # Only allow authenticated users to POST (create)
        if self.action == 'create':
            return [IsAuthenticated()]
        # All download-related actions and any other method must be admin
        return [IsAdminUser()]

    def get_queryset(self):
        """Allows filtering by `downloaded` status"""
        queryset = super().get_queryset()
        downloaded = self.request.query_params.get('downloaded')
        if downloaded is not None:
            if downloaded.lower() == 'true':
                queryset = queryset.filter(downloaded=True)
            elif downloaded.lower() == 'false':
                queryset = queryset.filter(downloaded=False)
        return queryset

    def generate_zip(self, instances):
        """Generate a ZIP file from a list of Update_Request instances"""
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for instance in instances:
                # Add metadata
                metadata = (
                    f"Transaction Hash: {instance.transaction_hash}\n"
                    f"Address: {instance.address}\n"
                    f"Update ID: {instance.update_id}\n"
                    f"Update Name: {instance.update_name}\n"
                    f"Burn IDs: {instance.burn_ids}\n"
                    f"Created At: {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
                    f"Downloaded: {instance.downloaded}\n"
                    f"Description: {instance.description}\n"
                )
                zip_file.writestr(f"{instance.transaction_hash}/metadata.txt", metadata)

                # Add image
                if instance.image:
                    try:
                        img_url = instance.get_image_original()
                        img_response = requests.get(img_url)
                        if img_response.status_code == 200:
                            ext = img_url.split('.')[-1].split('?')[0]
                            zip_file.writestr(f"{instance.transaction_hash}/image.{ext}", img_response.content)
                    except Exception as e:
                        zip_file.writestr(f"{instance.transaction_hash}/error.txt", f"Image failed: {str(e)}")

                instance.downloaded = True
                instance.save(update_fields=['downloaded'])

        zip_buffer.seek(0)
        return zip_buffer

    @action(detail=False, methods=['get'])
    def download_all(self, request):
        """Download all Update Requests"""
        instances = Update_Request.objects.all()
        zip_buffer = self.generate_zip(instances)
        return self._return_zip(zip_buffer, 'all_update_requests.zip')

    @action(detail=False, methods=['get'])
    def download_new(self, request):
        """Download only those not yet downloaded"""
        instances = Update_Request.objects.filter(downloaded=False)
        zip_buffer = self.generate_zip(instances)
        return self._return_zip(zip_buffer, 'new_update_requests.zip')

    @action(detail=False, methods=['get'])
    def download_downloaded(self, request):
        """Download only those already downloaded"""
        instances = Update_Request.objects.filter(downloaded=True)
        zip_buffer = self.generate_zip(instances)
        return self._return_zip(zip_buffer, 'already_downloaded_update_requests.zip')

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a single Update Request"""
        try:
            instance = self.get_object()
            zip_buffer = self.generate_zip([instance])
            return self._return_zip(zip_buffer, f"{instance.transaction_hash}.zip")
        except Update_Request.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def _return_zip(self, zip_buffer, filename):
        """Helper to return a zip as an HTTP response"""
        response = HttpResponse(zip_buffer, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class AppSettingsView(APIView): # auth
    permission_classes = [IsAdminUser] # Or your custom permission

    def update(self, request, *args, **kwargs):
        print("User:", request.user)
        print("Token valid:", request.auth)
        return super().update(request, *args, **kwargs)

    def get(self, request):
        settings = AppSettings.load()
        serializer = AppSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings = AppSettings.load()
        serializer = AppSettingsSerializer(settings, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        settings = AppSettings.load()
        serializer = AppSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
