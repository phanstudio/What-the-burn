from django.urls import path, include
from systems.views import (
    index,
    GetSignMessageView, VerifySignatureView,
    UpdateImageUrl, UpdateImageUrlFromIPFS,
    Gettokens, UpdateRequestViewSet,
    CleanupExpiredTokensView,
    AppSettingsView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'update-requests', UpdateRequestViewSet, basename='update-request')

urlpatterns = [
    path('', index),
    path('', include(router.urls)),
    path('sign-message/', GetSignMessageView.as_view(), name='sign-message'),
    path('verify-signature/', VerifySignatureView.as_view(), name='verify-signature'),
    path('update-image-url/', UpdateImageUrl.as_view(), name='update-image-url'),
    path('update-from-ipfs/', UpdateImageUrlFromIPFS.as_view(), name='update-image-url-from-ipfs'),
    path('user-tokens/', Gettokens.as_view(), name='user-tokens'),
    path('cleanup-expired-token/', CleanupExpiredTokensView.as_view(), name='cleanup-expired-token'),
    path('app-settings/', AppSettingsView.as_view(), name='app-settings'),
]
