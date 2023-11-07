from django.urls import path
from . import views

app_name = 'dokumenti'

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('dohvati_grupe_i_dokumente', views.dohvati_grupe_i_dokumente, name='dohvati_grupe_i_dokumente'),
    path('promijeni_sifru', views.promijeni_sifru, name='promijeni_sifru'),
    path('dodaj_zaposlenika', views.dodaj_zaposlenika, name='dodaj_zaposlenika')
]