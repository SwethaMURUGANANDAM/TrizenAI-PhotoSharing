from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Event(models.Model):
     name = models.CharField(max_length=200)
     created_by=models.ForeignKey(User,on_delete=models.CASCADE)
     created_at=models.DateTimeField(auto_now_add=True)
class EventMember(models.Model):
     event = models.ForeignKey(Event,on_delete=models.CASCADE)
     user = models.ForeignKey(User,on_delete=models.CASCADE)
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=['event', 'user'],
            name='unique_event_member'
        )
    ]
