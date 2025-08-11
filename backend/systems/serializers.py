from rest_framework import serializers
from .models import Update_Request, AppSettings

class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = '__all__'

class SignatureVerifySerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    signature = serializers.CharField()

class UpdateRequestSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image_small = serializers.SerializerMethodField()

    class Meta:
        model = Update_Request
        fields = [
            'transaction_hash', 'address', 'update_id', 'burn_ids', 'created_at',
            'update_name', 'image', 'image_url', 'image_small', 'downloaded', 
            'description',
        ]

    def get_image_url(self, obj):
        return obj.get_image_original()

    def get_image_small(self, obj):
        return obj.get_image_small()
