from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DriverTripListView,
    LocationDetailView,
    LocationListCreateView,
    RouteViewSet,  # updated
    TripDetailView,
    TripRequestCreateView,
    VehicleDetailView,
    VehicleListCreateView,
    AdminTripListView,
)

router = DefaultRouter()
router.register("vehicle/routes", RouteViewSet, basename="routes")

urlpatterns = [
    path("", include(router.urls)),
    path("vehicles/", VehicleListCreateView.as_view(), name="vehicle-list-create"),
    path("vehicles/<uuid:id>/", VehicleDetailView.as_view(), name="vehicle-detail"),
    path("locations/", LocationListCreateView.as_view(), name="location-list-create"),
    path("locations/<uuid:id>/", LocationDetailView.as_view(), name="location-detail"),
    # Remove manual route list/detail URLs — router covers these now!
    # path("routes/", RouteListCreateView.as_view(), name="route-list-create"),
    # path("routes/<uuid:id>/", RouteDetailView.as_view(), name="route-detail"),
    path("trips/", TripRequestCreateView.as_view(), name="trip-list-create"),
    path("trips/<uuid:id>/", TripDetailView.as_view(), name="trip-detail"),
    path("driver/trips/", DriverTripListView.as_view(), name="driver-trip-list"),
     path("admin/trips/", AdminTripListView.as_view(), name="admin-trip-list"),
]
