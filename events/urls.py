
from django.urls import path
from .views import EventCreateView,EventListView,EventMemberCreateView

urlpatterns = [
    path('create/', EventCreateView.as_view()),
     path('list/', EventListView.as_view()),
     path('members/add/', EventMemberCreateView.as_view()),
]