from django.db import models
from django.contrib.auth.models import User
from events.models import Event

# Create your models here.
class Photo(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    storage_location = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_selected = models.BooleanField(default=False)