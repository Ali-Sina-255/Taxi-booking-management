from django.contrib.auth import get_user_model
from django_countries.serializer_fields import CountryField
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    gender = serializers.CharField(source="profile.gender")
    phone_number = PhoneNumberField(source="profile.phone_number")
    profile_photo = serializers.ReadOnlyField(source="profile.profile_photo")
    country = CountryField(source="profile.country")
    city = serializers.CharField(source="profile.city")

    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "gender",
            "role",
            "phone_number",
            "profile_photo",
            "country",
            "city",
        ]

    def get_profile_photo(self, obj):
        try:
            if obj.profile.profile_photo and hasattr(obj.profile.profile_photo, "url"):
                return obj.profile.profile_photo.url
        except Exception:
            pass
        return None

    def to_representation(self, instance):
        representation = super(UserSerializer, self).to_representation(instance)
        if instance.is_superuser:
            representation["admin"] = True
        return representation


class CustomRegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES.choices,
    )
    username = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "password1",
            "password2",
        ]

    def validate(self, attrs):
        if attrs.get("password1") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def save(self, request=None, **kwargs):
        user = User.objects.create(
            username=self.validated_data["username"],
            email=self.validated_data["email"],
            first_name=self.validated_data["first_name"],
            last_name=self.validated_data["last_name"],
            is_active=True,
        )
        user.set_password(self.validated_data["password1"])
        user.save()
        return user


class PasswordChangeSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=10)
    uidb64 = serializers.CharField()
    reset_token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
