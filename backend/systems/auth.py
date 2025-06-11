from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import ExpiringToken

class ExpiringTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Token '):
            return None

        key = auth.split(' ')[1]
        try:
            token = ExpiringToken.objects.get(key=key)
        except ExpiringToken.DoesNotExist:
            raise AuthenticationFailed("Invalid token")

        if token.is_expired():
            token.delete()
            raise AuthenticationFailed("Token has expired")

        return (token.user, token)
