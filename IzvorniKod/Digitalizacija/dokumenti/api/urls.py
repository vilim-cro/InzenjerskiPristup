from django.urls import path
from . import views
from .views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('mojiDokumenti/', views.mojiDokumenti),
    path('sviDokumenti/', views.sviDokumenti),
    path('noviDokument/', views.noviDokument)
]
