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
    class Meta:
        model = Route
        fields = "__all__"
        # Prevent DRF from automatically adding UniqueTogetherValidator
        validators = []

    def validate(self, attrs):
        pickup = attrs.get("pickup")
        drop = attrs.get("drop")

        qs = Route.objects.filter(pickup=pickup, drop=drop)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                {"non_field_errors": ["This route already exists."]}
            )

        return attrs

    def create(self, validated_data):
        drivers = validated_data.pop("drivers", [])
        vehicles = validated_data.pop("vehicles", [])

        route = super().create(validated_data)
        route.drivers.set(drivers)
        route.vehicles.set(vehicles)
        return route

    def update(self, instance, validated_data):
        drivers = validated_data.pop("drivers", None)
        vehicles = validated_data.pop("vehicles", None)

        instance = super().update(instance, validated_data)

        if drivers is not None:
            instance.drivers.set(drivers)

        if vehicles is not None:
            instance.vehicles.set(vehicles)

        return instance


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
