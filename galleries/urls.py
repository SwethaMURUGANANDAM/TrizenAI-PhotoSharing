
from django.urls import path
from .views import GalleryCreateView,GalleryPhotoAddView,GalleryPublishView,PublicGalleryView

urlpatterns = [
    path('create/', GalleryCreateView.as_view()),
    path('photos/add/', GalleryPhotoAddView.as_view()),
    path('publish/<int:gallery_id>/', GalleryPublishView.as_view()),
    path('public/<str:public_token>/', PublicGalleryView.as_view()),
]