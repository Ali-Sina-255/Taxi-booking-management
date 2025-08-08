from rest_framework import generics, permissions

from .models import Location, Route, Trip, Vehicle
from .permissions import IsDriver, IsOwnerOrReadOnly, IsPassenger
from .serializers import (
    DriverTripSerializer,
    LocationSerializer,
    RouteSerializer,
    TripRequestSerializer,
    VehicleSerializer,
)


# Vehicle Views
class VehicleListCreateView(generics.ListCreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        # Only drivers can assign themselves as driver
        if user.role == "driver":
            serializer.save(driver=user)
        else:
            serializer.save()


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = "id"


# Location Views
class LocationListCreateView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"


# Route Views
class RouteListCreateView(generics.ListCreateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]


class RouteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"


# Trip Views
class TripRequestCreateView(generics.ListCreateAPIView):
    serializer_class = TripRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsPassenger]

    def get_queryset(self):
        # List only trips for the logged-in passenger
        return Trip.objects.filter(passenger=self.request.user)

    def perform_create(self, serializer):
        # Auto-assign the passenger on create
        serializer.save(passenger=self.request.user)


# For drivers to view trips assigned to them
class DriverTripListView(generics.ListAPIView):
    serializer_class = DriverTripSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        # List only trips assigned to logged-in driver
        return Trip.objects.filter(driver=self.request.user)


# Trip detail view for passenger or driver with owner permissions
class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TripRequestSerializer
    queryset = Trip.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = "id"

    def get_object(self):
        trip = super().get_object()
        user = self.request.user
        # Only passenger or driver assigned to trip can access it
        if trip.passenger != user and trip.driver != user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You do not have permission to access this trip.")
        return trip
