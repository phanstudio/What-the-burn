from django.db import models
import uuid
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

# add the record the transactions