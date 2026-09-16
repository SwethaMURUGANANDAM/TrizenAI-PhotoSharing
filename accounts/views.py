
from rest_framework.views import APIView
from .serializers import RegisterSerializer,TeamMemberCreateSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUserProfile
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=201
            )

        return Response(serializer.errors, status=400)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
          role = None
          if hasattr(request.user, 'userprofile'):
            role = request.user.userprofile.role
          return Response({
            "username": request.user.username,
            "email": request.user.email,
            "role": role
        })
class TeamMemberCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserProfile]

    def post(self, request):
        serializer = TeamMemberCreateSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "Team Member created successfully",
                    "username": user.username,
                    "email": user.email
                },
                status=201
            )

        return Response(serializer.errors, status=400)
