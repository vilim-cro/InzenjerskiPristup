from django.utils import timezone
from django.http import JsonResponse
from django.contrib.auth.models import User, Group
from django.shortcuts import render

import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from PIL import Image
import requests

from dokumenti.models import Dokument, InterniDokument
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

def dohvatiDokumente(**kwargs):
    filter_dict = {key: value for key, value in kwargs.items()}

    klase = Dokument.__subclasses__()
    dokumenti = [dokument for klasa in klase for dokument in klasa.objects.filter(**filter_dict)]

    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in dokumenti]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mojiDokumenti(request):
    return dohvatiDokumente(korisnik = request.user.pk)

@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def sviDokumenti(request):
    return dohvatiDokumente()

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
        d = InterniDokument(tekstDokumenta=text, linkSlike=url, vrijemeSkeniranja=timezone.now(), korisnik=request.user)
        if request.user.groups.filter(name='Revizori'):
            d.potvrdioRevizor = True
            d.revizor = request.user
        d.save()

    return Response(status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def promijeniLozinku(request):
    pass

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
@permission_classes([PripadaRevizorima])
def dokumentiZaReviziju(request):
    return dohvatiDokumente(potvrdioRevizor = False, revizor = request.user.pk)

@api_view(['GET'])
@permission_classes([PripadaRačunovođama])
def dokumentiZaPotvrdu(request):
    return dohvatiDokumente(pregledaoRačunovođa = False, računovođa = request.user.pk)

@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def dokumentiZaPotpis(request):
    return dohvatiDokumente(potpisaoDirektor = False, direktor = request.user.pk)


#naknadno treba nadograditi serverside provjeru sifre(duzina itd.)
# def promijeni_sifru(request):
#     user = get_user(request)
#     if not user.is_authenticated:
#        return HttpResponseRedirect(reverse('dokumenti:login'))
    
#     if request.method == 'POST':
#         old_password = request.POST["old_password"]
#         new_password = request.POST["new_password"]
#         user = authenticate(request, username=user.username, password=old_password)
#         if user is not None:
#             if new_password != old_password:
#                 user.set_password(new_password)
#                 user.save()     
#                 return JsonResponse(data={}, status=200) 
#             else:
#                 JsonResponse(data={}, status=400)
#         else:
#             return JsonResponse(data={}, status=405)
