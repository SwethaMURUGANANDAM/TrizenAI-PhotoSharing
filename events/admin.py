from django.contrib import admin
from .models import Event
from .models import Event, EventMember
admin.site.register(Event)
admin.site.register(EventMember)

# Register your models here.
