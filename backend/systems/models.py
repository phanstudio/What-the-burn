from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class EthUserManager(BaseUserManager):
    def create_user(self, address, password=None, **extra_fields):
        if not address:
            raise ValueError('The Ethereum address must be set')
        user = self.model(address=address, **extra_fields)

        if user.is_staff or user.is_superuser:
            if not password:
                raise ValueError("Admins must have a password")
            user.set_password(password)
        else:
            user.set_unusable_password()  # Normal users don't have passwords
        
        user.save(using=self._db)
        return user

    def create_superuser(self, address, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(address, password, **extra_fields)

class EthUser(AbstractBaseUser, PermissionsMixin):
    username = None  # Remove username
    email = None  # Remove email

    address = models.CharField(max_length=42, unique=True, primary_key= True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    nonce = models.CharField(max_length=100, default='', blank=True)

    objects = EthUserManager()

    USERNAME_FIELD = 'address'
    REQUIRED_FIELDS = []  # Required for Django — even if empty!

    def __str__(self):
        return self.address

class ImageUrl(models.Model):
    """Represents a coin on the platform"""
    id = models.IntegerField(default=1, unique=True, primary_key=True)
    url = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.url}"

class Update_Request(models.Model):
    transaction_hash = models.CharField(max_length=88, primary_key=True, unique= True, editable= False)
    address = models.CharField(max_length=44, editable=False)
    update_id = models.IntegerField()
    burn_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    update_name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=500)
    updated = models.BooleanField(default= False)

    def __str__(self):
        return f"{self.update_name} ({self.address})"

# your_app/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime

class ExpiringToken(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + datetime.timedelta(hours=6)  # Session TTL
        return super().save(*args, **kwargs)
