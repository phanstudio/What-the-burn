from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings
from django.utils import timezone
import datetime
from cloudinary.models import CloudinaryField
from cloudinary import CloudinaryImage

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

    address = models.CharField(max_length=42, unique=True, primary_key= True, db_index=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    nonce = models.CharField(max_length=100, default='', blank=True)

    objects = EthUserManager()

    USERNAME_FIELD = 'address'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.address

class ImageUrl(models.Model):
    """Represents a coin on the platform"""
    id = models.IntegerField(default=1, unique=True, primary_key=True, db_index= True)
    url = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.url}"

class AppSettings(models.Model):
    base_fee = models.DecimalField(max_digits=20, decimal_places=8, default=0.00)
    amount_to_burn = models.IntegerField(default=1000)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        return cls.objects.get_or_create(pk=1)[0]

    def __str__(self):
        return "App Settings"

class Lovecraft(models.Model):
    token_id = models.BigIntegerField()
    current_owner = models.CharField(max_length=42)
    block_number = models.BigIntegerField()
    timestamp = models.DecimalField(max_digits=30, decimal_places=0)
    transaction_hash = models.CharField(max_length=66)

    class Meta:
        managed = False  # Prevent Django from altering the table
        db_table = 'lovecraft'

class Whatcraft(models.Model):
    token_id = models.BigIntegerField()
    current_owner = models.CharField(max_length=42)
    block_number = models.BigIntegerField()
    timestamp = models.DecimalField(max_digits=30, decimal_places=0)
    transaction_hash = models.CharField(max_length=66)

    class Meta:
        managed = False  # Prevent Django from altering the table
        db_table = 'Whatcraft'

class Update_Request(models.Model):
    transaction_hash = models.CharField(max_length=88, primary_key=True, unique=True, null= False)
    address = models.CharField(max_length=44)
    update_id = models.IntegerField()
    burn_ids = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    update_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image = CloudinaryField('image')  # Cloudinary handles storage
    downloaded = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.update_name} ({self.address})"

    def get_image_small(self):
        """Returns small version (300x300)"""
        if self.image:
            return CloudinaryImage(self.image.public_id).build_url(width=300, height=300, crop='limit')
        return None

    def get_image_original(self):
        """Returns original version"""
        if self.image:
            return self.image.url
        return None

class ExpiringToken(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            if self.user.is_staff:
                # Admins: 1 day
                expiration_hours = getattr(settings, "ADMIN_EXPIRATION_HOURS", 24)
            else:
                # Regular users: 4x longer
                expiration_hours = getattr(settings, "USER_EXPIRATION_HOURS", 96)

            self.expires_at = timezone.now() + datetime.timedelta(hours=expiration_hours)
        return super().save(*args, **kwargs)
