from rest_framework.permissions import BasePermission
from dotenv import load_dotenv
import os
load_dotenv()

class HasCronSecretPermission(BasePermission):
    def has_permission(self, request, view):
        return request.META.get("HTTP_X_CRON_SECRET") == os.getenv('CRON_KEY')

class IsSuperUser(BasePermission):
    """
    Allows access only to superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)
