from datetime import datetime, timezone
from django.http import HttpResponse
from .models import EthUser, ImageUrl, Update_Request
import uuid
from eth_account.messages import encode_defunct
from eth_account import Account
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import (
    SignatureVerifySerializer, UpdateRequestSerializer
)
from django.conf import settings
from rest_framework.permissions import IsAuthenticated, AllowAny
from web3 import Web3
import requests
from rest_framework import generics
from .models import EthUser, ExpiringToken
from django.utils.crypto import get_random_string
from .serializers import SignatureVerifySerializer
import uuid
import os
from dotenv import load_dotenv
load_dotenv()

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

class GetSignMessageView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        wallet = request.query_params.get("wallet", "")
        user, _ = EthUser.objects.get_or_create(address=wallet)
        
        # Generate a new nonce
        user.nonce = str(uuid.uuid4())
        user.save()

        return Response({
            "message": f"Sign this message to authenticate: {user.nonce}"
        })

class VerifySignatureView(APIView):
    permission_classes = [AllowAny]
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
        user.nonce = str(uuid.uuid4())
        user.save()

        return Response({
            "token": token.key,
            "expires_at": token.expires_at
        })

class Gettokens(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        wallet = request.query_params.get("wallet", "")

        print(wallet)
        self.stdout.write(self.style.SUCCESS(str(wallet)))

        user = EthUser.objects.get(address=wallet)
        img_url = ImageUrl.objects.get(id=1)
        
        tokens = self.tokens_owned(user.address, img_url.url)

        return Response({
            "tokens": tokens
        })

    def tokens_owned(self, owner_address, image_url):
        url = os.getenv('THEGRAPH_URL')

        query = f"""
        query owner {{
        transfers(
            where: {{
            to: "{owner_address}",
            from_not: "{owner_address}"
            }}
        ) {{
            tokenId
        }}
        }}
        """
        response = requests.post(url, json={'query': query})

        # Check response
        if response.status_code == 200:
            response_json = response.json()
            token_ids = [{
                "id":entry["tokenId"],
                "image":f"{image_url}{entry["tokenId"]}.png",
                "name": f"What?! {entry["tokenId"]}" # can make dynamic or store
                } for entry in response_json["data"]["transfers"]]
            print(token_ids)
        else:
            print("Error:", response.status_code, response.text)

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

class UpdateRequestCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Update_Request.objects.all()
    serializer_class = UpdateRequestSerializer

# your_app/views.py
from .permissions import HasCronSecretPermission

# class CleanupExpiredTokensView(APIView):
#     permission_classes = [HasCronSecretPermission]

#     def post(self, request):
#         count, _ = ExpiringToken.objects.filter(expires_at__lte=timezone.now()).delete()
#         return Response({"deleted_tokens": count})

import logging

logger = logging.getLogger(__name__)

class CleanupExpiredTokensView(APIView):
    permission_classes = [HasCronSecretPermission]

    def post(self, request):
        try:
            count, _ = ExpiringToken.objects.filter(expires_at__lte=timezone.now()).delete()
            return Response({"deleted_tokens": count})
        except Exception as e:
            logger.exception("Failed to cleanup expired tokens")  # Logs full traceback
            return Response({"error": "Internal server error"}, status=500)
