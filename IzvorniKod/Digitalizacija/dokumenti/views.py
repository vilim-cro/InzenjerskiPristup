from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.contrib.auth import get_user
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.urls import reverse
import json
from .models import Ponuda
from .models import Račun
from .models import InterniDokument
from .models import Dokument
from . import utils
from PIL import Image
from . import DocumentReader
import requests
from django.utils import timezone
from rest_framework.response import Response


def index(request):
    user = get_user(request)
    if not user.is_authenticated:
       return HttpResponseRedirect(reverse('dokumenti:login'))

    return render(request, 'reactapp/public/index.html')

def dohvati_grupe_i_dokumente(request):
    user = get_user(request)
    if not user.is_authenticated:
        return JsonResponse(data={}, status=400)
    groups = []
    for group in user.groups.all():
        groups.append({"groupName": group.name, "groupID": group.id})

    sviDokumenti = []
    for ponuda in Ponuda.objects.all():
        if ponuda.skeniraoKorisnik == user:
            sviDokumenti.append(ponuda)
    for racun in Račun.objects.all():
        if racun.skeniraoKorisnik == user:
            sviDokumenti.append(racun)
    for interniDokument in InterniDokument.objects.all():
        if interniDokument.skeniraoKorisnik == user:
            sviDokumenti.append(interniDokument)

    return JsonResponse(data={
        "groups": groups,
        "dokumenti": [dokument.serialize() for dokument in sviDokumenti]
    }, status=200)

def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data["username"]
        password = data["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
    user = get_user(request)
    if user.is_authenticated:
       return HttpResponse(200)
    return JsonResponse(data={}, status=400)

#naknadno treba nadograditi serverside provjeru sifre(duzina itd.)
def promijeni_sifru(request):
    user = get_user(request)
    if not user.is_authenticated:
       return HttpResponseRedirect(reverse('dokumenti:login'))
    
    if request.method == 'POST':
        old_password = request.POST["old_password"]
        new_password = request.POST["new_password"]
        user = authenticate(request, username=user.username, password=old_password)
        if user is not None:
            if new_password != old_password:
                user.set_password(new_password)
                user.save()     
                return JsonResponse(data={}, status=200) 
            else:
                JsonResponse(data={}, status=400)
        else:
            return JsonResponse(data={}, status=405)

#potencijalno treba dodati stvari ovisno o formi i mozda neke provjere
def dodaj_zaposlenika(request):
    user = get_user(request)
    if not user.is_authenticated:
       return HttpResponseRedirect(reverse('dokumenti:login'))

    if not user.groups.filter(name='Direktori').exists():
        return render(request, 'reactapp/public/index.html', {
            "poruka": "Nemate pristup ovoj funkcionalnosti!"
        })
    
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST["password"]
        group = request.POST["group"]
        user = User.objects.create_user(username=username, password=password)
        user.save()
        group = Group.objects.get(name=group)
        group.user_set.add(user)
        group.save()
        return JsonResponse(data={}, status=200)
    

#bitno da je u formi enctype="multipart/form-data"    
def dodaj_sliku(request):
    if request.method == 'POST':
        images = request.FILES.getlist('slika')
        for image in images:
            resp = utils.uploadImage(image)
            url = resp['url']
            delete_url = resp['delete_url']
            resp = requests.get(url, stream=True)
            if resp.status_code == 200:
                image = Image.open(resp.raw)
                text = DocumentReader.DocumentReader.readDocument(image)
                d = InterniDokument(tekstDokumenta=text, linkSlike=url, vrijemeSkeniranja=timezone.now(), skeniraoKorisnik=request.user)
                d.save()
            else:
                text = "Error while reading image"
                HttpResponse(text)


        return HttpResponse("Slika uspješno dodana!")

         
    