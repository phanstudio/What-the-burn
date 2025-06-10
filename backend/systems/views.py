from datetime import datetime
from django.http import HttpResponse
from .models import EthUser
import uuid
# import requests
from eth_account.messages import encode_defunct
from eth_account import Account
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    SignatureVerifySerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny

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

        # Signature valid — issue JWT
        refresh = RefreshToken.for_user(user)

        # Rotate nonce
        user.nonce = str(uuid.uuid4())
        user.save()

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
