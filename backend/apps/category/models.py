from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:  # type: ignore
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ["name"]


class AttributeType(models.Model):
    class AttributeChoiceType(models.TextChoices):
        DROPDOWN = "dropdown", "Dropdown"
        DATE = "date", "Date"
        CHECKBOX = "checkbox", "Checkbox"
        INPUT = "input", "Input"

    name = models.CharField(max_length=50)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="attribute_types"
    )
    attribute_type = models.CharField(
        max_length=10,
        choices=AttributeChoiceType.choices,
        default=AttributeChoiceType.INPUT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def clean(self):
        existing = AttributeType.objects.filter(
            name=self.name, category=self.category
        ).exclude(pk=self.pk)
        if existing.exists():
            raise ValidationError(
                f"An attribute with the name '{self.name}' already exists in the category '{self.category.name}'."
            )
        super().clean()

    class Meta:
        unique_together = ["name", "category"]
        ordering = ["-category"]


class AttributeValue(models.Model):
    attribute = models.ForeignKey(
        AttributeType,
        on_delete=models.CASCADE,
        related_name="attribute_values",
    )
    attribute_value = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        attr_name = self.attribute.name if self.attribute else "N/A"
        return f"{self.attribute_value} (for {attr_name})"

    def clean(self):
        existing = AttributeValue.objects.filter(
            attribute=self.attribute, attribute_value=self.attribute_value
        ).exclude(pk=self.pk)
        if existing.exists():
            attr_name = self.attribute.name if self.attribute else "N/A"
            raise ValidationError(
                f"An attribute value '{self.attribute_value}' already exists for the attribute '{attr_name}'."
            )
        super().clean()

    class Meta:  # type: ignore
        unique_together = ["attribute", "attribute_value"]
        ordering = ["-attribute"]
