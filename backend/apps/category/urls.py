from django.urls import path

from .views import (
    AttributeTypeDetailView,
    AttributeTypeListView,
    AttributeValueListView,
    CategoryDetailView,
    CategoryListView,
)

urlpatterns = [
    path("", CategoryListView.as_view(), name="category-list"),
    path("<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path("attribute/", AttributeTypeListView.as_view(), name="attribute"),
    path("attribute-value/", AttributeValueListView.as_view(), name="attribute"),
    path(
        "attribute/<int:pk>/",
        AttributeTypeDetailView.as_view(),
        name="attribute-details",
    ),
]
