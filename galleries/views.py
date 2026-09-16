from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from .models import Gallery,GalleryPhoto
from .serializers import GallerySerializer,GalleryPhotoSerializer
from events.models import Event
from accounts.permissions import IsAdminUserProfile
from photos.models import Photo

import secrets

from django.contrib.auth.hashers import make_password, check_password
class GalleryCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserProfile]

    def post(self, request):
        event_id = request.data.get('event')
        pin = request.data.get('pin')

        if not event_id:
            return Response(
                {"message": "Event is required"},
                status=400
            )

        if not pin:
            return Response(
                {"message": "PIN is required"},
                status=400
            )

        try:
            event = Event.objects.get(
                id=event_id,
                created_by=request.user
            )
        except Event.DoesNotExist:
            return Response(
                {"message": "Event not found"},
                status=404
            )

        if Gallery.objects.filter(event=event).exists():
            return Response(
                {"message": "Gallery already exists for this event"},
                status=400
            )

        public_token = secrets.token_urlsafe(32)

        gallery = Gallery.objects.create(
    event=event,
    public_token=public_token,
    pin=make_password(pin)
)

        return Response(
            GallerySerializer(gallery).data,
            status=201
        )
class GalleryPhotoAddView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserProfile]

    def post(self, request):
        gallery_id = request.data.get('gallery')
        photo_id = request.data.get('photo')

        if not gallery_id or not photo_id:
            return Response(
                {"message": "Gallery and photo are required"},
                status=400
            )

        try:
            gallery = Gallery.objects.get(
                id=gallery_id,
                event__created_by=request.user
            )
        except Gallery.DoesNotExist:
            return Response(
                {"message": "Gallery not found"},
                status=404
            )

        try:
            photo = Photo.objects.get(
                id=photo_id,
                event=gallery.event
            )
        except Photo.DoesNotExist:
            return Response(
                {"message": "Photo not found for this event"},
                status=404
            )

        if not photo.is_selected:
            return Response(
                {"message": "Only selected photos can be added to gallery"},
                status=400
            )

        gallery_photo, created = GalleryPhoto.objects.get_or_create(
            gallery=gallery,
            photo=photo
        )

        if not created:
            return Response(
                {"message": "Photo already added to gallery"},
                status=400
            )

        return Response(
            GalleryPhotoSerializer(gallery_photo).data,
            status=201
        )
class GalleryPublishView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserProfile]

    def patch(self, request, gallery_id):
        try:
            gallery = Gallery.objects.get(
                id=gallery_id,
                event__created_by=request.user
            )
        except Gallery.DoesNotExist:
            return Response(
                {"message": "Gallery not found"},
                status=404
            )

        if gallery.is_published:
            return Response(
                {"message": "Gallery is already published"},
                status=400
            )

        if not GalleryPhoto.objects.filter(gallery=gallery).exists():
            return Response(
                {"message": "Add at least one photo before publishing"},
                status=400
            )

        gallery.is_published = True
        gallery.save()

        return Response(
            {
                "message": "Gallery published successfully",
                "gallery_id": gallery.id,
                "public_token": gallery.public_token,
                "is_published": gallery.is_published
            },
            status=200
        )
class PublicGalleryView(APIView):
    authentication_classes = []
    permission_classes = []


    def post(self, request, public_token):
        pin = request.data.get('pin')

        if not pin:
            return Response(
                {"message": "PIN is required"},
                status=400
            )

        try:
            gallery = Gallery.objects.get(
                public_token=public_token
            )
        except Gallery.DoesNotExist:
            return Response(
                {"message": "Gallery not found"},
                status=404
            )

        if not gallery.is_published:
            return Response(
                {"message": "Gallery is not published"},
                status=403
            )

        if not check_password(pin, gallery.pin):
            return Response(
                {"message": "Incorrect PIN"},
                status=403
            )

        gallery_photos = GalleryPhoto.objects.filter(
            gallery=gallery
        ).select_related('photo')

        photos = [
            {
                "id": gp.photo.id,
                "filename": gp.photo.filename,
                "storage_location": gp.photo.storage_location
            }
            for gp in gallery_photos
        ]

        return Response(
            {
                "message": "PIN verified successfully",
                "gallery_id": gallery.id,
                "event": gallery.event.name,
                "photos": photos
            },
            status=200
        )
# Create your views here.
