import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    class ROLE_CHOICES(models.TextChoices):
        admin = "admin", "Admin"
        user = "user", "User"
        driver = 'driver', "Driver"

    pkid = models.BigAutoField(primary_key=True, editable=True)
    id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(
        max_length=150, unique=True, blank=True, null=True, verbose_name=_("Username")
    )
    first_name = models.CharField(verbose_name=_("First Name"), max_length=255)
    last_name = models.CharField(verbose_name=_("Last Name"), max_length=255)
    email = models.CharField(
        verbose_name=_("Email"), max_length=255, db_index=True, unique=True
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES.choices,
        default=ROLE_CHOICES.user,
        blank=True,
        null=True,
    )

    otp = models.CharField(max_length=1000, null=True, blank=True)
    reset_token = models.CharField(max_length=1000, null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        return self.first_name

    @property
    def get_full_name(self):
        return f"{self.first_name.title()} {self.last_name.title()}"

    @property
    def get_short_name(self):
        return self.first_name

    def save(self,*args, **kwargs):
        email_username, _ = self.email.split("@")
        if self.username == '' or self.username is None:
            self.username = email_username
        return super(User,self).save(*args, **kwargs)