
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import EventSerializer,EventMemberSerializer
from accounts.permissions import IsAdminUserProfile
from .models import Event,EventMember


class EventCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserProfile]

    def post(self, request):
        serializer = EventSerializer(data=request.data)

        if serializer.is_valid():
            event = serializer.save(created_by=request.user)

            return Response(
                EventSerializer(event).data,
                status=201
            )

        return Response(serializer.errors, status=400)


class EventListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'userprofile') and request.user.userprofile.role == 'ADMIN':
            events = Event.objects.filter(created_by=request.user)

        elif hasattr(request.user, 'userprofile') and request.user.userprofile.role == 'TEAM_MEMBER':
            events = Event.objects.filter(eventmember__user=request.user)

        else:
            return Response(
                {"message": "You are not authorized"},
                status=403
            )

        serializer = EventSerializer(events, many=True)

        return Response(serializer.data)
class EventMemberCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserProfile]

    def post(self, request):
        event_id = request.data.get('event')
        user_id = request.data.get('user')

        if not event_id or not user_id:
            return Response(
                {"message": "Event and user are required"},
                status=400
            )

        try:
            event = Event.objects.get(
                id=event_id,
                created_by=request.user
            )
        except Event.DoesNotExist:
            return Response(
                {"message": "Event not found or you are not the owner"},
                status=404
            )

        try:
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=404
            )

        if not hasattr(user, 'userprofile') or user.userprofile.role != 'TEAM_MEMBER':
            return Response(
                {"message": "Only Team Members can be assigned"},
                status=400
            )

        if EventMember.objects.filter(event=event, user=user).exists():
            return Response(
                {"message": "User is already assigned to this event"},
                status=400
            )

        event_member = EventMember.objects.create(
            event=event,
            user=user
        )

        return Response(
            EventMemberSerializer(event_member).data,
            status=201
        )