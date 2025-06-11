from django.urls import path
from systems.views import (
    index,
    GetSignMessageView, VerifySignatureView,
    UpdateImageUrl, UpdateImageUrlFromIPFS,
    Gettokens, UpdateRequestCreateView,
    CleanupExpiredTokensView
)

urlpatterns = [
    path('', index),
    path('sign-message/', GetSignMessageView.as_view(), name='sign-message'),
    path('verify-signature/', VerifySignatureView.as_view(), name='verify-signature'),
    path('update-image-url/', UpdateImageUrl.as_view(), name='update-image-url'),
    path('update-from-ipfs/', UpdateImageUrlFromIPFS.as_view(), name='update-image-url-from-ipfs'),
    path('user-tokens/', Gettokens.as_view(), name='user-tokens'),
    path('update-request/', UpdateRequestCreateView.as_view(), name='create-update-request'),
    path('cleanup-expired-token/', CleanupExpiredTokensView.as_view(), name='cleanup-expired-token'),
]
