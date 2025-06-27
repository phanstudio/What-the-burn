from rest_framework import serializers
from web3 import Web3
from datetime import datetime, timedelta, timezone
from eth_utils import function_signature_to_4byte_selector
from django.conf import settings
from .models import Update_Request, EthUser, AppSettings

w3 = Web3(Web3.HTTPProvider(settings.ETH_PROVIDER_URL))
BURN_SIGS = ["burn(uint256)", "burn(address,uint256)"]
BURN_SELECTORS = [function_signature_to_4byte_selector(sig).hex() for sig in BURN_SIGS]

class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = '__all__'

class SignatureVerifySerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    signature = serializers.CharField()

# class UpdateRequestSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Update_Request
#         fields = '__all__'
#         read_only_fields = ['created_at', 'updated']

#     def validate_address(self, address):
#         address = Web3.to_checksum_address(address)
#         if not EthUser.objects.filter(address__iexact=address).exists():
#             raise serializers.ValidationError("Wallet address is not registered.")
#         return address

#     def validate_transaction_hash(self, tx_hash): # will have to disable the thing
#         try:
#             tx = w3.eth.get_transaction(tx_hash)
#         except Exception:
#             raise serializers.ValidationError("Transaction hash is invalid or not found.")

#         user_address = self.initial_data.get("address", "").lower()
#         if tx["from"].lower() != user_address:
#             raise serializers.ValidationError("Transaction sender does not match provided address.")

#         # ✅ Check burn() function call
#         input_data = tx["input"]
#         selector = input_data[:10]
#         if not any(selector == ("0x" + sel) for sel in BURN_SELECTORS):
#             raise serializers.ValidationError("Transaction does not call a recognized burn function.")

#         # ✅ Check timestamp
#         try:
#             block = w3.eth.get_block(tx["blockNumber"])
#             block_time = datetime.fromtimestamp(block["timestamp"], tz=timezone.utc)
#         except Exception:
#             raise serializers.ValidationError("Unable to fetch transaction block.")

#         if datetime.now(tz=timezone.utc) - block_time > timedelta(minutes=settings.ETH_TX_MAX_AGE_MINUTES):
#             raise serializers.ValidationError("Transaction is older than allowed window.")

#         # ✅ Check logs for actual token burn to 0x0
#         try:
#             receipt = w3.eth.get_transaction_receipt(tx_hash)
#         except Exception:
#             raise serializers.ValidationError("Unable to fetch transaction receipt.")

#         burn_found = False
#         contract_address = Web3.to_checksum_address(settings.ETH_COLLECTION_CONTRACT)
#         transfer_topic = w3.keccak(text="Transfer(address,address,uint256)").hex()

#         for log in receipt["logs"]:
#             if log["address"].lower() == contract_address.lower():
#                 if log["topics"][0].hex().lower() == transfer_topic.lower():
#                     to = "0x" + log["topics"][2].hex()[-40:]
#                     if Web3.to_checksum_address(to) == Web3.to_checksum_address("0x0000000000000000000000000000000000000000"):
#                         burn_found = True
#                         break

#         if not burn_found:
#             raise serializers.ValidationError("No burn event from the collection contract was found.")

#         return tx_hash

class UpdateRequestSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image_small = serializers.SerializerMethodField()

    class Meta:
        model = Update_Request
        fields = [
            'transaction_hash', 'address', 'update_id', 'burn_ids', 'created_at',
            'update_name', 'image', 'image_url', 'image_small', 'downloaded'
        ]

    def get_image_url(self, obj):
        return obj.get_image_original()

    def get_image_small(self, obj):
        return obj.get_image_small()
