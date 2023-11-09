from django.http import JsonResponse
from django.contrib.auth.models import User, Group
from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from PIL import Image
import requests

from dokumenti.models import Dokument
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mojiDokumenti(request):
    klase = Dokument.__subclasses__()
    dokumenti = [dokument for klasa in klase for dokument in klasa.objects.filter(skeniraoKorisnik = request.user.pk)]

    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in dokumenti]
    })

@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def sviDokumenti(request):
    klase = Dokument.__subclasses__()
    dokumenti = [dokument for klasa in klase for dokument in klasa.objects.all()]

    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in dokumenti]
    })

# Bitno da je slika u formi enctype="multipart/form-data"    
@api_view(['GET', 'POST'])
#@permission_classes([IsAuthenticated])
def noviDokument(request):
    if request.method == 'GET':
        return render(request, 'dokumenti/uploadSlike.html')
    
    # Baca error zbog vise slika, vraca <MultiValueDict: {}>
    print(request.FILES)
    image = request.FILES['slika']
    resp = uploadImage(image)
    print(resp['delete_url'])
    url = resp['url']
    delete_url = resp['delete_url']

    print(url)
    resp = requests.get(url, stream=True)
    print(url)
    if resp.status_code == 200:
        image = Image.open(resp.raw)
        text = DocumentReader.DocumentReader.readDocument(image)
    else:
        text = "Error while reading image"

    # Pokreni OCR funckiju koja vraća tekst
    # ...

    # Promijenit da stvara novi dokument
    return JsonResponse({
        "url": url,
        "delete_url": delete_url,
        "text": text
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def promijeniLozinku(request):
    pass

@api_view(['POST'])
@permission_classes([PripadaDirektorima])
def dodajKorisnika(request):
    username = request.POST["username"]
    password = request.POST["password"]
    first_name = request.POST["ime"]
    last_name = request.POST["prezime"]
    email = request.POST["email"]
    group = request.POST["group"]
    user = User.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name, email=email)
    user.save()
    group = Group.objects.get(name=group)
    group.user_set.add(user)
    group.save()
    return Response(status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([PripadaRevizorima])
def dokumentiZaReviziju(request):
    klase = Dokument.__subclasses__()
    dokumenti = [dokument for klasa in klase for dokument in klasa.objects.filter(potvrđen=False)]

    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in dokumenti]
    })

@api_view(['GET'])
@permission_classes([PripadaRačunovođama])
def dokumentiZaPotvrdu(request):
    pass

@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def dokumentiZaPotpis(request):
    pass

