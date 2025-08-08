from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Location, Route, Trip, Vehicle

User = get_user_model()


class VehicleSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.get_full_name", read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "driver",
            "driver_name",
            "model",
            "plate_number",
            "license",
            "type",
        ]
        read_only_fields = ["driver_name"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name"]


class RouteSerializer(serializers.ModelSerializer):
    pickup = LocationSerializer(read_only=True)
    drop = LocationSerializer(read_only=True)
    pickup_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source="pickup", write_only=True
    )
    drop_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source="drop", write_only=True
    )
    drivers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role="driver"),
        required=False,
    )
    vehicles = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Vehicle.objects.all(),
        required=False,
    )

    class Meta:
        model = Route
        fields = [
            "id",
            "pickup",
            "drop",
            "pickup_id",
            "drop_id",
            "price_af",
            "drivers",
            "vehicles",
        ]


class TripRequestSerializer(serializers.ModelSerializer):
    route_id = serializers.PrimaryKeyRelatedField(
        queryset=Route.objects.all(), source="route", write_only=True
    )

    class Meta:
        model = Trip
        fields = [
            "id",
            "route_id",
            "distance_km",
            "fare",
            "status",
            "request_time",
            "start_time",
            "end_time",
        ]
        read_only_fields = ["fare", "status", "request_time", "start_time", "end_time"]

    def validate(self, data):
        user = self.context["request"].user
        if user.role != "passenger":
            raise serializers.ValidationError("Only passengers can create trips.")
        return data

    def create(self, validated_data):
        validated_data["passenger"] = self.context["request"].user
        return super().create(validated_data)


class DriverTripSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(
        source="passenger.get_full_name", read_only=True
    )
    pickup = serializers.CharField(source="route.pickup.name", read_only=True)
    drop = serializers.CharField(source="route.drop.name", read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "passenger_name",
            "pickup",
            "drop",
            "fare",
            "status",
            "request_time",
        ]
