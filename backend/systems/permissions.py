from rest_framework.permissions import BasePermission
from dotenv import load_dotenv
import os
load_dotenv()
import logging

logger = logging.getLogger(__name__)

class HasCronSecretPermission(BasePermission):
    def has_permission(self, request, view):
        logger.info(os.getenv('CRON_KEY'))
        logger.info( request.META.get("HTTP_X_CRON_SECRET"))
        logger.info(request.META.get("HTTP_X_CRON_SECRET") == os.getenv('CRON_KEY'))
        return request.META.get("HTTP_X_CRON_SECRET") == os.getenv('CRON_KEY')