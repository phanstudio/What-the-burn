from rest_framework import serializers

class SignatureVerifySerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    signature = serializers.CharField()
