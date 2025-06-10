from django.core.management.base import BaseCommand
from systems.models import Token
import requests
from time import sleep

BASE_URL = "https://bafybeicgcpt5irvve7eseutbnhlreu762sfp7db2tcpilex6leag7sodlq.ipfs.w3s.link/"
BATCH_SIZE = 100  # Tune this as needed


class Command(BaseCommand):
    help = "Populate Token table with token_id and image_uri from IPFS JSON files"

    def add_arguments(self, parser):
        parser.add_argument('--start', type=int, default=1, help='Start token ID')
        parser.add_argument('--end', type=int, default=5555, help='End token ID')

    def handle(self, *args, **options):
        start = options['start']
        end = options['end']

        tokens_to_create = []

        for token_id in range(start, end + 1):
            json_url = f"{BASE_URL}{token_id}.json"
            try:
                response = requests.get(json_url, timeout=5)
                response.raise_for_status()
                data = response.json()
                image_uri = data.get("image")

                if image_uri:
                    tokens_to_create.append(Token(token_id=token_id, image_uri=image_uri))
                    self.stdout.write(self.style.SUCCESS(f"Fetched token {token_id}"))
                else:
                    self.stdout.write(self.style.WARNING(f"No image for token {token_id}"))

            except Exception as e:
                self.stderr.write(f"Error fetching {json_url}: {e}")
                continue

            # Save in batches
            if len(tokens_to_create) >= BATCH_SIZE:
                self._bulk_upsert(tokens_to_create)
                tokens_to_create = []
                sleep(0.02)  # Be nice to IPFS gateway

        # Final batch
        if tokens_to_create:
            self._bulk_upsert(tokens_to_create)

        self.stdout.write(self.style.SUCCESS("Finished populating tokens."))

    def _bulk_upsert(self, token_objs):
        Token.objects.bulk_create(
            token_objs,
            batch_size=BATCH_SIZE,
            update_conflicts=True,          # Requires Django 4.1+
            update_fields=["image_uri"],
            unique_fields=["token_id"],
        )
        self.stdout.write(self.style.SUCCESS(f"Saved batch of {len(token_objs)} tokens"))
