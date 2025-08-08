from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions

from .models import AttributeType, AttributeValue, Category
from .pagination import CustomPageNumberPagination
from .serializers import (
    AttributeTypeSerializer,
    AttributeValueSerializer,
    CategorySerializer,
)


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_class = [permissions.IsAuthenticated]
    pagination_class = CustomPageNumberPagination


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_class = [permissions.IsAuthenticated]


class AttributeTypeListView(generics.ListCreateAPIView):
    queryset = AttributeType.objects.select_related("category").all()
    serializer_class = AttributeTypeSerializer
    permission_class = [permissions.IsAuthenticated]
    pagination_class = CustomPageNumberPagination

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["name"]


class AttributeTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AttributeType.objects.select_related("category").all()
    serializer_class = AttributeTypeSerializer
    permission_class = [permissions.IsAuthenticated]
    pagination_class = CustomPageNumberPagination


class AttributeValueListView(generics.ListCreateAPIView):
    queryset = AttributeValue.objects.select_related("attribute").all()
    serializer_class = AttributeValueSerializer
    permission_class = [permissions.IsAuthenticated]
    pagination_class = CustomPageNumberPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["attribute_value"]


class AttributeValueDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AttributeValue.objects.select_related("attribute").all()
    serializer_class = AttributeValueSerializer
    permission_class = [permissions.IsAuthenticated]
    pagination_class = CustomPageNumberPagination
    pagination_class = CustomPageNumberPagination
