from django.core.management.base import BaseCommand
from systems.models import ImageUrl
import requests
from web3 import Web3
from django.conf import settings

class Command(BaseCommand):
    help = "Update table with image_uri"

    def add_arguments(self, parser):
        parser.add_argument('--url', type=str, default="", help='Defualt image_uri')
        parser.add_argument('--ipfs', action='store_true', help='From IPFS JSON files')

    def handle(self, *args, **options):
        url:str = options['url']
        ipfs = options['ipfs']
        if ipfs:
            self.handel_ipfs()
        elif len(url) > 3:
            self.update(url)
        else:
            self.stderr.write(f"Error invalid parameters")

    def handel_ipfs(self):
        json_url = self.get_token_uri(1)
        try:
            response = requests.get(json_url, timeout=5)
            response.raise_for_status()
            data = response.json()
            image_uri:str = data.get("image")
            image_uri = image_uri.split("/1.")[0]+"/"

        except Exception as e:
            self.stderr.write(f"Error fetching {json_url}: {e}")
        self.update(image_uri)

    def update(self, img):
        ImageUrl.objects.update_or_create(id=1, url=img)
        self.stdout.write(self.style.SUCCESS("Finished populating tokens."))

    def get_token_uri(self, token_id:int = 1)-> str:
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
