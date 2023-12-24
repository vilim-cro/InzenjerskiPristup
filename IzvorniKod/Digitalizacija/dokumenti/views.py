from django.utils import timezone
from django.http import JsonResponse
from django.contrib.auth.models import User, Group

import json
import re

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from PIL import Image
import requests

from dokumenti.models import Dokument, InterniDokument, NedefiniraniDokument, Račun, Ponuda, Artikl, InterniDokumentArhiviran, NedefiniraniDokumentArhiviran, RačunArhiviran, PonudaArhivirana
from .permissions import PripadaDirektorima, PripadaRevizorima, PripadaRačunovođama
from dokumenti.utils import uploadImage
from dokumenti import DocumentReader

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['groups'] = [group.name for group in user.groups.all()]
        # ...

        return token
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# Pomoćne funkcije

def dohvatiDokumente(**kwargs):
    filter_dict = {key: value for key, value in kwargs.items()}

    klase = Dokument.__subclasses__()
    dokumenti = [dokument for klasa in klase for dokument in klasa.objects.filter(**filter_dict)]

    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in dokumenti]
    })


# API endpointi za rad s korisnicima

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def promijeniLozinku(request):
    data = json.loads(request.body)
    old_password = data["trenutnaLozinka"]
    new_password = data["novaLozinka"]
    if not request.user.check_password(old_password):
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if new_password == old_password:
        return Response(status=status.HTTP_418_IM_A_TEAPOT)
    request.user.set_password(new_password)
    request.user.save()
    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([PripadaDirektorima])
def dodajKorisnika(request):
    data = json.loads(request.body)
    username = data["username"]
    password = data["password"]
    first_name = data["ime"]
    last_name = data["prezime"]
    email = data["email"]
    group = data["group"]
    user = User.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name, email=email)
    user.save()
    group = Group.objects.get(name=group)
    group.user_set.add(user)
    group.save()
    return Response(status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dohvatiKorisnikeGrupe(request, grupa):
    try:
        grupa = Group.objects.get(name=grupa)
    except Group.DoesNotExist:
        return JsonResponse(data={}, status=404)
    korisnici = grupa.user_set.all()
    return JsonResponse(data={
        "korisnici": [{"id": korisnik.id, "username": korisnik.username} for korisnik in korisnici]
    })


# API endpointi za rad s dokumentima

# Dohvati dokumente

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mojiDokumenti(request):
    return dohvatiDokumente(korisnik = request.user.pk)

@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def sviDokumenti(request):
    return dohvatiDokumente()


@api_view(['GET'])
@permission_classes([PripadaRevizorima])
def dokumentiZaReviziju(request):
    return dohvatiDokumente(potvrdioRevizor = False, revizor = request.user.pk)

@api_view(['GET'])
@permission_classes([PripadaRačunovođama])
def dokumentiZaPotvrdu(request):
    return dohvatiDokumente(računovođa = request.user.pk, direktor = None)

@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def dokumentiZaPotpis(request):
    return dohvatiDokumente(potpisaoDirektor = False, direktor = request.user.pk)


# Kreiraj novi dokument

#bitno da je u formi enctype="multipart/form-data"
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def noviDokument(request):
    # if request.method == 'GET':
    #     return render(request, 'dokumenti/uploadSlike.html')
    images = request.FILES.getlist('slika')
    for image in images:
        resp = uploadImage(image)
        url = resp['url']
        delete_url = resp['delete_url']
        resp = requests.get(url, stream=True)

        if resp.status_code != 200:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        image = Image.open(resp.raw)
        text = DocumentReader.DocumentReader.readDocument(image)

        racun_pattern = r'R\d{6}'
        ponuda_pattern = r'P\d{9}'
        internidokument_pattern = r'INT\d{4}'

        if (re.search(racun_pattern, text)):
            d = Račun(tekstDokumenta=text, linkSlike=url, vrijemeSkeniranja=timezone.now(), korisnik=request.user)
        elif (re.search(ponuda_pattern, text)):
            d = Ponuda(tekstDokumenta=text, linkSlike=url, vrijemeSkeniranja=timezone.now(), korisnik=request.user)
        elif (re.search(internidokument_pattern, text)):
            d = InterniDokument(tekstDokumenta=text, linkSlike=url, vrijemeSkeniranja=timezone.now(), korisnik=request.user)
        else:
            d = NedefiniraniDokument(tekstDokumenta=text, linkSlike=url, vrijemeSkeniranja=timezone.now(), korisnik=request.user)

        if request.user.groups.filter(name='Revizori'):
            d.potvrdioRevizor = True
            d.revizor = request.user
        d.save()

    return Response(status=status.HTTP_201_CREATED)


# Mijenjaj postojeće dokumente

# Dokumentima dodijeli status

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def označiTočnostSkeniranja(request, dokument_id):
    data = json.loads(request.body)
    tocnost = data["tocnost"]
    if (InterniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = InterniDokument.objects.get(pk=dokument_id)
    elif (NedefiniraniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = NedefiniraniDokument.objects.get(pk=dokument_id)
    elif (Račun.objects.filter(pk=dokument_id).exists()):
        dokument = Račun.objects.get(pk=dokument_id)
    elif (Ponuda.objects.filter(pk=dokument_id).exists()):
        dokument = Ponuda.objects.get(pk=dokument_id)

    dokument.tocnostSkeniranja = tocnost
    dokument.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([PripadaRevizorima])
def potvrdi(request, dokument_id):
    if (InterniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = InterniDokument.objects.get(pk=dokument_id)
    elif (NedefiniraniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = NedefiniraniDokument.objects.get(pk=dokument_id)
    elif (Račun.objects.filter(pk=dokument_id).exists()):
        dokument = Račun.objects.get(pk=dokument_id)
    elif (Ponuda.objects.filter(pk=dokument_id).exists()):
        dokument = Ponuda.objects.get(pk=dokument_id)

    dokument.potvrdioRevizor = True
    dokument.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([PripadaDirektorima])
def potpiši(request, dokument_id):
    if (InterniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = InterniDokument.objects.get(pk=dokument_id)
    elif (NedefiniraniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = NedefiniraniDokument.objects.get(pk=dokument_id)
    elif (Račun.objects.filter(pk=dokument_id).exists()):
        dokument = Račun.objects.get(pk=dokument_id)
    elif (Ponuda.objects.filter(pk=dokument_id).exists()):
        dokument = Ponuda.objects.get(pk=dokument_id)

    dokument.potpisaoDirektor = True
    dokument.save()
    return Response(status=status.HTTP_200_OK)

# Dokumentima dodijeli korisnika

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def dodijeliRevizora(request, dokument_id):
    data = json.loads(request.body)
    revizor = data["korisnik_id"]
    if (InterniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = InterniDokument.objects.get(pk=dokument_id)
    elif (NedefiniraniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = NedefiniraniDokument.objects.get(pk=dokument_id)
    elif (Račun.objects.filter(pk=dokument_id).exists()):
        dokument = Račun.objects.get(pk=dokument_id)
    elif (Ponuda.objects.filter(pk=dokument_id).exists()):
        dokument = Ponuda.objects.get(pk=dokument_id)

    dokument.revizor = revizor
    dokument.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([PripadaRevizorima])
def dodijeliRačunovođu(request, dokument_id):
    data = json.loads(request.body)
    racunovoda = data["korisnik_id"]
    if (InterniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = InterniDokument.objects.get(pk=dokument_id)
    elif (NedefiniraniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = NedefiniraniDokument.objects.get(pk=dokument_id)
    elif (Račun.objects.filter(pk=dokument_id).exists()):
        dokument = Račun.objects.get(pk=dokument_id)
    elif (Ponuda.objects.filter(pk=dokument_id).exists()):
        dokument = Ponuda.objects.get(pk=dokument_id)

    dokument.računovođa = racunovoda
    dokument.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([PripadaRačunovođama])
def dodijeliDirektora(request, dokument_id):
    data = json.loads(request.body)
    direktor = data["korisnik_id"]
    if (InterniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = InterniDokument.objects.get(pk=dokument_id)
    elif (NedefiniraniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = NedefiniraniDokument.objects.get(pk=dokument_id)
    elif (Račun.objects.filter(pk=dokument_id).exists()):
        dokument = Račun.objects.get(pk=dokument_id)
    elif (Ponuda.objects.filter(pk=dokument_id).exists()):
        dokument = Ponuda.objects.get(pk=dokument_id)

    dokument.direktor = direktor
    dokument.save()
    return Response(status=status.HTTP_200_OK)


# Arhiviranjem dokumenta

@api_view(['PUT'])
@permission_classes([PripadaRačunovođama])
def arhiviraj(request, dokument_id):
    if (InterniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = InterniDokument.objects.get(pk=dokument_id)
        a = InterniDokumentArhiviran(tekstDokumenta=dokument.tekstDokumenta, linkSlike=dokument.linkSlike, vrijemeSkeniranja=dokument.vrijemeSkeniranja, 
                                     dokumentId=dokument.pk, vrijemeArhiviranja=timezone.now(), korisnik=dokument.korisnik, revizor=dokument.revizor, 
                                     računovođa=dokument.računovođa, direktor=dokument.direktor, potvrdioRevizor=dokument.potvrdioRevizor, potpisaoDirektor=dokument.potpisaoDirektor, 
                                     pregledaoRačunovođa=dokument.računovođa)
        a.save()
    elif (NedefiniraniDokument.objects.filter(pk=dokument_id).exists()):
        dokument = NedefiniraniDokument.objects.get(pk=dokument_id)
        a = NedefiniraniDokumentArhiviran(tekstDokumenta=dokument.tekstDokumenta, linkSlike=dokument.linkSlike, vrijemeSkeniranja=dokument.vrijemeSkeniranja, 
                                     dokumentId=dokument.pk, vrijemeArhiviranja=timezone.now(), korisnik=dokument.korisnik, revizor=dokument.revizor, 
                                     računovođa=dokument.računovođa, direktor=dokument.direktor, potvrdioRevizor=dokument.potvrdioRevizor, potpisaoDirektor=dokument.potpisaoDirektor, 
                                     pregledaoRačunovođa=dokument.računovođa)
        a.save()
    elif (Račun.objects.filter(pk=dokument_id).exists()):
        dokument = Račun.objects.get(pk=dokument_id)
        a = RačunArhiviran(tekstDokumenta=dokument.tekstDokumenta, linkSlike=dokument.linkSlike, vrijemeSkeniranja=dokument.vrijemeSkeniranja, 
                                     dokumentId=dokument.pk, vrijemeArhiviranja=timezone.now(), korisnik=dokument.korisnik, revizor=dokument.revizor, 
                                     računovođa=dokument.računovođa, direktor=dokument.direktor, potvrdioRevizor=dokument.potvrdioRevizor, potpisaoDirektor=dokument.potpisaoDirektor, 
                                     pregledaoRačunovođa=dokument.računovođa, imeKlijenta=dokument.imeKlijenta, ukupnaCijena=dokument.ukupnaCijena)
        a.save()
    elif (Ponuda.objects.filter(pk=dokument_id).exists()):
        dokument = Ponuda.objects.get(pk=dokument_id)
        a = PonudaArhivirana(tekstDokumenta=dokument.tekstDokumenta, linkSlike=dokument.linkSlike, vrijemeSkeniranja=dokument.vrijemeSkeniranja, 
                                     dokumentId=dokument.pk, vrijemeArhiviranja=timezone.now(), korisnik=dokument.korisnik, revizor=dokument.revizor, 
                                     računovođa=dokument.računovođa, direktor=dokument.direktor, potvrdioRevizor=dokument.potvrdioRevizor, potpisaoDirektor=dokument.potpisaoDirektor, 
                                     pregledaoRačunovođa=dokument.računovođa, ukupnaCijena=dokument.ukupnaCijena)
        a.save()
    
    dokument.delete()
    return Response(status=status.HTTP_200_OK)
