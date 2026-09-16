from rest_framework import serializers
from .models import Event,EventMember


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']
class EventMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventMember
        fields = ['id', 'event', 'user']
        read_only_fields = ['id']
