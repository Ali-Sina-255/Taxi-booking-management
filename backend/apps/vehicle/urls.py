from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    DriverTripListView,
    LocationDetailView,
    LocationListCreateView,
    RouteDetailView,
    RouteListCreateView,
    TripDetailView,
    TripRequestCreateView,
    VehicleDetailView,
    VehicleListCreateView,
)

router = DefaultRouter(trailing_slash=False)


urlpatterns = [
    # Vehicle URLs
    path("vehicles/", VehicleListCreateView.as_view(), name="vehicle-list-create"),
    path("vehicles/<uuid:id>/", VehicleDetailView.as_view(), name="vehicle-detail"),
    # Location URLs
    path("locations/", LocationListCreateView.as_view(), name="location-list-create"),
    path("locations/<uuid:id>/", LocationDetailView.as_view(), name="location-detail"),
    # Route URLs
    path("routes/", RouteListCreateView.as_view(), name="route-list-create"),
    path("routes/<uuid:id>/", RouteDetailView.as_view(), name="route-detail"),
    # Trip URLs
    path("trips/", TripRequestCreateView.as_view(), name="trip-list-create"),
    path("trips/<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    # Driver-specific trips
    path("driver/trips/", DriverTripListView.as_view(), name="driver-trip-list"),
]
