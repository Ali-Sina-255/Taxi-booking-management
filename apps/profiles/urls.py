from django.urls import path

from . import views

urlpatterns = [
    path("all/", views.ProfileListAPIView.as_view(), name="all-profiles"),
    path("me/", views.ProfileDetailAPIView.as_view(), name="my-profile"),
    path("me/update/", views.UpdateProfileAPIView.as_view(), name="update-profile"),
]
