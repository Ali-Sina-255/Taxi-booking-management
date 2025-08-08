from config.settings.local import DEFAULT_FROM_EMAIL
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile
from .pagination import ProfilePagination
from .renderers import ProfileJsonRenderers, ProfilesJsonRenderers
from .serializers import ProfileSerializers, UpdateProfileSerializer

User = get_user_model()


class ProfileListAPIView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializers
    permission_classes = [IsAuthenticated]
    pagination_class = ProfilePagination
    renderer_classes = [ProfilesJsonRenderers]


class ProfileDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProfileSerializers
    renderer_classes = [ProfileJsonRenderers]

    def get_queryset(self):
        queryset = Profile.objects.select_related("user")
        return queryset

    def get_object(self):
        user = self.request.user
        profile = self.get_queryset().get(user=user)
        return profile


class UpdateProfileAPIView(generics.UpdateAPIView):
    serializer_class = ProfileSerializers
    pagination_class = ProfilePagination
    permission_classes = [IsAuthenticated]
    renderer_classes = [ProfileJsonRenderers]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile = self.request.user.profile
        return profile

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
