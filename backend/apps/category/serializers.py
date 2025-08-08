from rest_framework import serializers  # type: ignore
from rest_framework.exceptions import ValidationError
from rest_framework.fields import UUIDField

from .models import AttributeType, AttributeValue, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at", "updated_at"]


class AttributeTypeSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = AttributeType
        fields = [
            "id",
            "name",
            "category",
            "attribute_type",
            "created_at",
            "created_at",
        ]


class AttributeValueSerializer(serializers.ModelSerializer):

    class Meta:
        model = AttributeValue
        fields = [
            "id",
            "attribute",
            # "attribute_name",
            "attribute_value",
            "created_at",
            "updated_at",
        ]
