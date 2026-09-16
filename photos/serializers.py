
from rest_framework import serializers
from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = [
            'id',
            'event',
            'uploaded_by',
            'filename',
            'storage_location',
            'file_size',
            'created_at',
             'is_selected'
        ]
        read_only_fields = [
            'id',
            'uploaded_by',
            'filename',
            'storage_location',
            'file_size',
            'created_at',
             'is_selected'
        ]