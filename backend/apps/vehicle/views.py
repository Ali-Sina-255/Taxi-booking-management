# apps/vehicle/views.py

from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Location, Route, Trip, Vehicle, DriverApplication
from .permissions import IsAdmin, IsDriver, IsOwnerOrReadOnly, IsPassenger
from .serializers import (
    AdminDriverApplicationSerializer, AdminTripListSerializer, AdminTripUpdateSerializer,
    DriverApplicationSerializer, DriverTripSerializer, LocationSerializer, RouteSerializer,
    TripRequestSerializer, TripUpdateSerializer, VehicleSerializer
)

class VehicleListCreateView(generics.ListCreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "driver":
            serializer.save(driver=user)
        elif user.role == "admin":
            serializer.save()
        else:
            raise PermissionDenied("You do not have permission to create a vehicle.")


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = "id"


class LocationListCreateView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    lookup_field = "id"


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class TripRequestCreateView(generics.ListCreateAPIView):
    serializer_class = TripRequestSerializer
    permission_classes = [permissions.IsAuthenticated, (IsPassenger | IsDriver)]

    def get_queryset(self):
        return Trip.objects.filter(passenger=self.request.user)

    def perform_create(self, serializer):
        serializer.save(passenger=self.request.user)


class AdminTripListView(generics.ListAPIView):
    queryset = Trip.objects.select_related('passenger', 'route__pickup', 'route__drop', 'driver').all().order_by('-request_time')
    serializer_class = AdminTripListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class DriverTripListView(generics.ListAPIView):
    serializer_class = DriverTripSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        return Trip.objects.filter(driver=self.request.user)


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    permission_classes = [permissions.IsAuthenticated, (IsOwnerOrReadOnly | IsAdmin)]
    lookup_field = "id"

    def get_serializer_class(self):
        user = self.request.user
        if self.request.method in ['PATCH', 'PUT']:
            if user.role == 'admin':
                return AdminTripUpdateSerializer
            return TripUpdateSerializer
        return TripRequestSerializer


# --- Driver Application Views ---

class DriverApplicationCreateView(generics.CreateAPIView):
    queryset = DriverApplication.objects.all()
    serializer_class = DriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsPassenger]

class AdminApplicationListView(generics.ListAPIView):
    queryset = DriverApplication.objects.all().order_by('status', '-created_at')
    serializer_class = AdminDriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

# --- THIS IS THE MISSING VIEW CLASS ---
class AdminApplicationDetailView(generics.RetrieveUpdateAPIView):
    """
    For an ADMIN to approve or deny a single application.
    """
    queryset = DriverApplication.objects.all()
    serializer_class = AdminDriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    lookup_field = 'id' # Use the application's UUID for the lookup