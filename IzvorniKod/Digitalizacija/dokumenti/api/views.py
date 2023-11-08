from django.http import JsonResponse

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from dokumenti.models import Dokument

from django.contrib.auth.models import User, Group

from .permissions import PripadaDirektorima

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def noviDokument(request):
    slika = request.body.slika
    
    # Pohrani sliku u static/dokumenti/slike (mislim da moramo) i spremi link
    
    # ... 

    # Pokreni OCR i spremi text

    # ...

    # Kreiraj novi dokument i saveaj ga


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