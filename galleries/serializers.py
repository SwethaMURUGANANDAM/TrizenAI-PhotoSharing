
from rest_framework import serializers
from .models import Gallery, GalleryPhoto


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ['id','event','public_token','is_published','created_at']
        read_only_fields = [
            'id',
            'public_token',
            'is_published',
            'created_at'
        ]


class GalleryPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryPhoto
        fields = [
            'id',
            'gallery',
            'photo'
        ]
        read_only_fields = ['id']