
from django.urls import path
from .views import PhotoUploadView,MyPhotosView,AdminPhotosView,PhotoSelectionView

urlpatterns = [
    path('upload/', PhotoUploadView.as_view()),
    path('my-photos/', MyPhotosView.as_view()),
    path('admin-photos/', AdminPhotosView.as_view()),
    path('select/<int:photo_id>/', PhotoSelectionView.as_view()),
]