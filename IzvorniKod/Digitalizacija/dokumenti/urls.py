from django.urls import path
from . import views
from .views import MyTokenObtainPairView

app_name = 'dokumenti'

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('mojiDokumenti/', views.mojiDokumenti),
    path('sviDokumenti/', views.sviDokumenti),
    path('noviDokument/', views.noviDokument),
    path('dokumentiZaReviziju/', views.dokumentiZaReviziju),
    path('dokumentiZaPotvrdu/', views.dokumentiZaPotvrdu),
    path('dokumentiZaPotpis/', views.dokumentiZaPotpis),

    path('dodajKorisnika/', views.dodajKorisnika),
    path('promijeniLozinku/', views.promijeniLozinku),
    path('dohvatiKorisnikeGrupe/<str:grupa>', views.dohvatiKorisnikeGrupe),

    path('označiTočnostSkeniranja/<int:dokument_id>', views.označiTočnostSkeniranja),
    path('potvrdi/<int:dokument_id>', views.potvrdi),
    path('pregledaj/<int:dokument_id>', views.pregledaj),
    path('potpiši/<int:dokument_id>', views.potpiši),

    path('dodijeliRevizora/<int:dokument_id>', views.dodijeliRevizora),
    path('dodijeliRačunovođu/<int:dokument_id>', views.dodijeliRačunovođu),
    path('dodijeliDirektora/<int:dokument_id>', views.dodijeliDirektora),

    path('arhiviraj/<int:dokument_id>', views.arhiviraj),

]