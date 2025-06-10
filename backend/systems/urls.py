from django.urls import path
from systems.views import (
    index,
    GetSignMessageView, VerifySignatureView
)

urlpatterns = [
    path('', index),
    path('sign-message/', GetSignMessageView.as_view(), name='sign-message'),
    path('verify-signature/', VerifySignatureView.as_view(), name='verify-signature'),
    # path('user-tokens/', UserTokensView.as_view(), name='user-tokens'),
]
