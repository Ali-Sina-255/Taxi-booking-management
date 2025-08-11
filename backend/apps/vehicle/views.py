from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import Location, Route, Trip, Vehicle
from .permissions import IsDriver, IsOwnerOrReadOnly, IsPassenger
from .serializers import (
    DriverTripSerializer,
    LocationSerializer,
    RouteSerializer,
    TripRequestSerializer,
    VehicleSerializer,
    TripUpdateSerializer,
    AdminTripUpdateSerializer,
    AdminTripListSerializer,
)
from .permissions import IsDriver, IsOwnerOrReadOnly, IsPassenger, IsAdmin

# Vehicle Views
class VehicleListCreateView(generics.ListCreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Custom logic for creating a vehicle based on user role.
        """
        user = self.request.user

        if user.role == "driver":
            # If the user is a driver, they are assigned as the vehicle's driver.
            serializer.save(driver=user)
        
        elif user.role == "admin":
            driver = serializer.validated_data.get('driver')
            if not driver:
                # If the driver is not provided by the admin, raise a validation error.
                raise ValidationError({"driver": ["This field is required."]})
            
            # If a driver was provided, save the vehicle with that driver.
            serializer.save(driver=driver)
        
        else:
            # If the user is neither a driver nor an admin, deny permission.
            raise PermissionDenied("You do not have permission to create a vehicle.")

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


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer


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
        return Trip.objects.filter(passenger=self.request.user)

    def perform_create(self, serializer):
        serializer.save(passenger=self.request.user)


class DriverTripListView(generics.ListAPIView):
    serializer_class = DriverTripSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        # List only trips assigned to logged-in driver
        return Trip.objects.filter(driver=self.request.user)


# Trip detail view for passenger or driver with owner permissions
class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    # An action is permitted if the user is an owner OR an admin.
    permission_classes = [(IsOwnerOrReadOnly | IsAdmin)]
    lookup_field = "id"

    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the user's role and request method.
        """
        user = self.request.user
        if user.role == 'admin' and self.request.method in ['PATCH', 'PUT']:
            # Admins use the special serializer for updates.
            return AdminTripUpdateSerializer
        
        if self.request.method in ['PATCH', 'PUT']:
            # Drivers/Passengers use the simple status update serializer.
            return TripUpdateSerializer
        
        # Everyone uses the detailed serializer for viewing.
        return TripRequestSerializer

    def get_object(self):
        # The get_object permission check can be simplified now that the
        # main permission_classes handles it.
        return super().get_object()
    
class AdminTripListView(generics.ListAPIView):
    queryset = Trip.objects.select_related('passenger', 'route__pickup', 'route__drop', 'driver').all().order_by('-request_time')
    # --- THIS IS THE FIX ---
    # We must use the serializer that was specifically designed for this page.
    serializer_class = AdminTripListSerializer
    # --- END OF FIX ---
    permission_classes = [permissions.IsAuthenticated, IsAdmin]