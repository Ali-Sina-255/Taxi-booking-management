from apps.common.models import TimeStampedModel
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models

User = get_user_model()


# ----------------------------
# VEHICLE MODEL
# ----------------------------


class Vehicle(TimeStampedModel):
    LUXURY = "luxury"
    ECONOMY = "economy"
    SUV = "suv"
    VAN = "van"
    ELECTRIC = "electric"

    VEHICLE_TYPE_CHOICES = [
        (LUXURY, "Luxury"),
        (ECONOMY, "Economy"),
        (SUV, "SUV"),
        (VAN, "Van"),
        (ELECTRIC, "Electric"),
    ]

    driver = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        limit_choices_to={"role": "driver"},
        related_name="vehicles",
    )
    model = models.CharField(max_length=200)
    plate_number = models.CharField(max_length=20, unique=True)
    license = models.ImageField(upload_to="license/")
    type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)

    def __str__(self):
        return f"{self.model} - {self.plate_number}"


# ----------------------------
# LOCATION MODEL
# ----------------------------


class Location(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


# ----------------------------
# ROUTE MODEL
# ----------------------------


class Route(TimeStampedModel):
    pickup = models.ForeignKey(
        Location, related_name="routes_from", on_delete=models.CASCADE
    )
    drop = models.ForeignKey(
        Location, related_name="routes_to", on_delete=models.CASCADE
    )
    price_af = models.DecimalField(max_digits=10, decimal_places=2)

    drivers = models.ManyToManyField(
        User,
        limit_choices_to={"role": "driver"},
        blank=True,
        related_name="available_routes",
    )
    vehicles = models.ManyToManyField(
        Vehicle, blank=True, related_name="available_routes"
    )

    class Meta:
        unique_together = ("pickup", "drop")
        verbose_name = "Route"
        verbose_name_plural = "Routes"

    def __str__(self):
        return f"{self.pickup} ➜ {self.drop} - {self.price_af} AF"




class Trip(TimeStampedModel):
    passenger = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="passenger_trips"
    )
    driver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="driver_trips",
    )
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.SET_NULL, null=True, blank=True
    )
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="trips")

    distance_km = models.FloatField(default=0)  # You can calculate this dynamically
    fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    STATUS_CHOICES = [
        ("requested", "Requested"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="requested"
    )
    request_time = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Trip {self.id} by {self.passenger.get_full_name}"

    def clean(self):
        if self.passenger.role != User.Role.PASSENGER:
            raise ValidationError("Assigned passenger must have role 'passenger'.")
        if self.driver and self.driver.role != User.Role.DRIVER:
            raise ValidationError("Assigned driver must have role 'driver'.")

    def save(self, *args, **kwargs):
        # Auto-set fare if not manually set
        if not self.fare and self.route:
            self.fare = self.route.price_af

        # Auto-assign driver and vehicle if not manually set
        if not self.driver:
            self.driver = self.route.drivers.first()

        if not self.vehicle and self.driver:
            self.vehicle = self.route.vehicles.filter(driver=self.driver).first()

        self.full_clean()
        super().save(*args, **kwargs)
