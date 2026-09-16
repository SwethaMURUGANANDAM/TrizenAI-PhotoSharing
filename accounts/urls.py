
from django.urls import path
from .views import RegisterView,MeView,TeamMemberCreateView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
urlpatterns = [
        path('register/', RegisterView.as_view()),
        path('login/', TokenObtainPairView.as_view()),
        path('me/',MeView.as_view()),
        path('team-members/create/', TeamMemberCreateView.as_view()),
]
