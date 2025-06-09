from django.urls import path
from systems.views import index


urlpatterns = [
    path('', index),
]
