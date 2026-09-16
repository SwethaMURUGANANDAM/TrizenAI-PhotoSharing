
import cloudinary.uploader

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import PhotoSerializer
from events.models import Event
from .models import Photo


class PhotoUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        event_id = request.data.get('event')
        file = request.FILES.get('file')

        if not event_id:
            return Response(
                {"message": "Event is required"},
                status=400
            )

        if not file:
            return Response(
                {"message": "Photo file is required"},
                status=400
            )

        if not hasattr(request.user, 'userprofile') or request.user.userprofile.role != 'TEAM_MEMBER':
            return Response(
                {"message": "Only Team Members can upload photos"},
                status=403
            )

        if not file.content_type.startswith('image/'):
            return Response(
                {"message": "Only image files are allowed"},
                status=400
            )

        MAX_FILE_SIZE = 10 * 1024 * 1024

        if file.size > MAX_FILE_SIZE:
            return Response(
                {"message": "File size must be 10 MB or less"},
                status=400
            )

        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {"message": "Event not found"},
                status=404
            )

        if not event.eventmember_set.filter(user=request.user).exists():
            return Response(
                {"message": "You are not assigned to this event"},
                status=403
            )

        try:
            result = cloudinary.uploader.upload(
                file,
                folder=f"trizenai/events/{event.id}"
            )
        except Exception:
            return Response(
                {"message": "Photo upload failed. Please try again."},
                status=500
            )

        storage_location = result["secure_url"]
        filename = file.name
        file_size = file.size

        serializer = PhotoSerializer(
            data={
                "event": event.id
            }
        )

        if serializer.is_valid():
            photo = serializer.save(
                uploaded_by=request.user,
                filename=filename,
                storage_location=storage_location,
                file_size=file_size
            )

            return Response(
                PhotoSerializer(photo).data,
                status=201
            )

        return Response(serializer.errors, status=400)


class MyPhotosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        photos = Photo.objects.filter(
            uploaded_by=request.user
        )

        serializer = PhotoSerializer(
            photos,
            many=True
        )

        return Response(serializer.data)


class AdminPhotosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'userprofile'):
            return Response(
                {"message": "You are not authorized"},
                status=403
            )

        if request.user.userprofile.role != 'ADMIN':
            return Response(
                {"message": "Only Admin can view all photos"},
                status=403
            )

        photos = Photo.objects.filter(
            event__created_by=request.user
        )

        serializer = PhotoSerializer(
            photos,
            many=True
        )

        return Response(serializer.data)


class PhotoSelectionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, photo_id):
        if not hasattr(request.user, 'userprofile'):
            return Response(
                {"message": "You are not authorized"},
                status=403
            )

        if request.user.userprofile.role != 'ADMIN':
            return Response(
                {"message": "Only Admin can select photos"},
                status=403
            )

        try:
            photo = Photo.objects.get(
                id=photo_id,
                event__created_by=request.user
            )
        except Photo.DoesNotExist:
            return Response(
                {"message": "Photo not found"},
                status=404
            )

        is_selected = request.data.get('is_selected')

        if not isinstance(is_selected, bool):
            return Response(
                {"message": "is_selected must be true or false"},
                status=400
            )

        photo.is_selected = is_selected
        photo.save()

        return Response(
            {
                "message": "Photo selection updated",
                "photo_id": photo.id,
                "is_selected": photo.is_selected
            }
        )