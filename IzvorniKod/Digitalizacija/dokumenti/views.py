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

from dokumenti.models import Dokument, InterniDokument, NedefiniraniDokument, Račun, Ponuda, RačunArhiviran, PonudaArhivirana, InterniDokumentArhiviran, NedefiniraniDokumentArhiviran, Artikl
from .permissions import PripadaDirektorima, PripadaRevizorima, PripadaRačunovođama
from dokumenti.utils import uploadImage, getDocumentType
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


# Helper funkcije
    
def set_attribute(dokument_id: int, attribute: str, value: str):
    if Dokument.objects.filter(pk=dokument_id).exists():
        dokument = Dokument.objects.get(pk=dokument_id)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    setattr(dokument, attribute, value)
    dokument.save()
    return Response(status=status.HTTP_200_OK)


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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dohvatiSpecijaliziraneRačunovođe(request, specijalizacija):
    računovođe = User.objects.filter(groups__name="Računovođe")
    if specijalizacija == "Računi":
        korisnici = računovođe.filter(specijalizacije__tipSpecijalizacije=0)
    elif specijalizacija == "Ponude":
        korisnici = računovođe.filter(specijalizacije__tipSpecijalizacije=1)
    elif specijalizacija == "InterniDokumenti":
        korisnici = računovođe.filter(specijalizacije__tipSpecijalizacije=2)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    return JsonResponse(data={
        "korisnici": [{"id": korisnik.id, "username": korisnik.username} for korisnik in korisnici]
    })

# API endpointi za rad s dokumentima

# Dohvati dokumente

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mojiDokumenti(request):
    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in Dokument.objects.filter(korisnik = request.user.pk)]
    })
@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def sviDokumenti(request):
    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in Dokument.objects.all()]
    })


@api_view(['GET'])
@permission_classes([PripadaRevizorima])
def dokumentiZaReviziju(request):
    dokumenti = Dokument.objects.filter(revizor = request.user.pk, potvrdioRevizor = False)
    return JsonResponse(data={
        "dokumenti": [{**dokument.serialize(), "type": getDocumentType(dokument.oznakaDokumenta)} 
                      for dokument in dokumenti]
    })

@api_view(['GET'])
@permission_classes([PripadaRačunovođama])
def dokumentiZaPotvrdu(request):
    dokumenti = Dokument.objects.filter(računovođa = request.user.pk, direktor = None) \
        | Dokument.objects.filter(računovođa = request.user.pk, potpisaoDirektor = True)
    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in dokumenti]
    })

@api_view(['GET'])
@permission_classes([PripadaDirektorima])
def dokumentiZaPotpis(request):
    dokumenti = Dokument.objects.filter(potpisaoDirektor = False, direktor = request.user.pk)
    return JsonResponse(data={
        "dokumenti": [dokument.serialize() for dokument in dokumenti]
    })


# Kreiraj novi dokument

#bitno da je u formi enctype="multipart/form-data"
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def noviDokument(request):
    images = request.FILES.getlist('slika')
    failed = 0
    for image in images:
        resp = uploadImage(image)
        url = resp['url']
        resp = requests.get(url, stream=True)

        if resp.status_code != 200:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        image = Image.open(resp.raw)
        success, text = DocumentReader.DocumentReader.readDocument(image)
        
        if not success:
            failed += 1
            continue

        racun_pattern = r'R\d{6}'
        ponuda_pattern = r'P\d{9}'
        internidokument_pattern = r'INT\d{4}'

        keyword_args = {
            'tekstDokumenta': text,
            'linkSlike': url,
            'vrijemeSkeniranja': timezone.now(),
            'korisnik': request.user
        }

        if (re.search(racun_pattern, text)):
            oznaka = re.search(racun_pattern, text).group(0)
            postojeci_dokument = Dokument.objects.filter(oznakaDokumenta=oznaka).first()
            if postojeci_dokument:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            else:
                keyword_args['oznakaDokumenta'] = oznaka
                ukupna_cijena_pattern = r'Ukupna cijena: (\d+.\d+)'
                ukupna_cijena = re.search(ukupna_cijena_pattern, text).group(1)
                keyword_args['ukupnaCijena'] = ukupna_cijena
                ime_klijenta_pattern = r'Ime klijenta: ([^\d\n]+)'
                ime_klijenta = re.search(ime_klijenta_pattern, text).group(1)
                keyword_args['imeKlijenta'] = ime_klijenta
                d = Račun(**keyword_args)
                d.save()
                artikl_pattern = r'([^\d\n]+)\s+(\d+.\d+)'
                artikli = re.findall(artikl_pattern, text)
                for artikl in artikli:
                    ime, cijena = artikl
                    if ime !="Ukupna cijena:":
                        postojeci_artikl = Artikl.objects.filter(imeArtikla=ime, cijenaArtikla=cijena).first()
                        if postojeci_artikl:
                            d.artikli.add(postojeci_artikl)
                        else:
                            d.artikli.add(Artikl.objects.create(imeArtikla=ime, cijenaArtikla=cijena))
        elif (re.search(ponuda_pattern, text)):
            oznaka = re.search(ponuda_pattern, text).group(0)
            postojeci_dokument = Dokument.objects.filter(oznakaDokumenta=oznaka).first()
            if postojeci_dokument:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            else:
                keyword_args['oznakaDokumenta'] = oznaka
                ukupna_cijena_pattern = r'Ukupna cijena: (\d+.\d+)'
                ukupna_cijena = re.search(ukupna_cijena_pattern, text).group(1)
                keyword_args['ukupnaCijena'] = ukupna_cijena
                d = Ponuda(**keyword_args)
                d.save()
                artikl_pattern = r'([^\d\n]+)\s+(\d+.\d+)'
                artikli = re.findall(artikl_pattern, text)
                for artikl in artikli:
                    ime, cijena = artikl
                    if ime !="Ukupna cijena:":
                        postojeci_artikl = Artikl.objects.filter(imeArtikla=ime, cijenaArtikla=cijena).first()
                        if postojeci_artikl:
                            d.artikli.add(postojeci_artikl)
                        else:
                            d.artikli.add(Artikl.objects.create(imeArtikla=ime, cijenaArtikla=cijena))
        elif (re.search(internidokument_pattern, text)):
            d = InterniDokument(**keyword_args)
        else:
            d = NedefiniraniDokument(**keyword_args)

        if request.user.groups.filter(name='Revizori'):
            d.potvrdioRevizor = True
            d.revizor = request.user
        d.save()

    return Response(status=status.HTTP_201_CREATED) if failed == 0\
        else Response({"failed": failed}, status=status.HTTP_207_MULTI_STATUS)


# Mijenjaj postojeće dokumente

# Dokumentima dodijeli status

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def označiTočnostSkeniranja(request, dokument_id):
    data = json.loads(request.body)
    tocnost = data["tocnost"]
    return set_attribute(dokument_id, "točnoSkeniran", tocnost)

@api_view(['PUT'])
@permission_classes([PripadaRevizorima])
def potvrdi(request, dokument_id):
    return set_attribute(dokument_id, "potvrdioRevizor", True)

@api_view(['PUT'])
@permission_classes([PripadaDirektorima])
def potpiši(request, dokument_id):
    return set_attribute(dokument_id, "potpisaoDirektor", True)

# Dokumentima dodijeli korisnika

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def dodijeliRevizora(request, dokument_id):    
    data = json.loads(request.body)
    revizor = data["korisnik_id"]
    if not Group.objects.get(name="Revizori").user_set.filter(pk=revizor).exists():
        return Response(status=status.HTTP_400_BAD_REQUEST)
    return set_attribute(dokument_id, "revizor", User.objects.get(pk=revizor))

@api_view(['PUT'])
@permission_classes([PripadaRevizorima])
def dodijeliRačunovođu(request, dokument_id):    
    data = json.loads(request.body)
    racunovoda = data["korisnik_id"]
    if not Group.objects.get(name="Računovođe").user_set.filter(pk=racunovoda).exists():
        return Response(status=status.HTTP_400_BAD_REQUEST)
    return set_attribute(dokument_id, "računovođa", User.objects.get(pk=racunovoda))


@api_view(['PUT'])
@permission_classes([PripadaRačunovođama])
def dodijeliDirektora(request, dokument_id):
    data = json.loads(request.body)
    direktor = data["korisnik_id"]
    if not Group.objects.get(name="Direktori").user_set.filter(pk=direktor).exists():
        return Response(status=status.HTTP_400_BAD_REQUEST)
    return set_attribute(dokument_id, "direktor", User.objects.get(pk=direktor))


# Arhiviranjem dokumenta

@api_view(['PUT'])
@permission_classes([PripadaRačunovođama])
def arhiviraj(request, dokument_id):
    if Dokument.objects.filter(pk=dokument_id).exists():
        dokument = Dokument.objects.get(pk=dokument_id)
    else:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if InterniDokument.objects.filter(pk=dokument_id).exists():
        new_model_class = InterniDokumentArhiviran
    elif NedefiniraniDokument.objects.filter(pk=dokument_id).exists():
        new_model_class = NedefiniraniDokumentArhiviran
    elif Račun.objects.filter(pk=dokument_id).exists():
        new_model_class = RačunArhiviran
    elif Ponuda.objects.filter(pk=dokument_id).exists():
        new_model_class = PonudaArhivirana
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    archived_document = new_model_class()
    for field in dokument._meta.fields:
        if field.name != 'id':
            setattr(archived_document, field.name, getattr(dokument, field.name))
    archived_document.vrijemeArhiviranja = timezone.now()
    archived_document.dokumentId = dokument_id
    archived_document.save()
    if new_model_class == RačunArhiviran:
        archived_document.imeKlijenta = Račun.objects.get(pk=dokument_id).imeKlijenta
        archived_document.ukupnaCijena = Račun.objects.get(pk=dokument_id).ukupnaCijena
        archived_document.save()
        for artikl in Račun.objects.get(pk=dokument_id).artikli.all():
            archived_document.artikli.add(artikl)
    elif new_model_class == PonudaArhivirana:
        archived_document.ukupnaCijena = Ponuda.objects.get(pk=dokument_id).ukupnaCijena
        archived_document.save()
        for artikl in Ponuda.objects.get(pk=dokument_id).artikli.all():
            archived_document.artikli.add(artikl)
    

    # Copy ManyToManyField relations
    for field in dokument._meta.get_fields():
        if field.many_to_many and not field.auto_created:
            source = getattr(dokument, field.name).all()
            getattr(archived_document, field.name).set(source)
    
    dokument.delete()
    return Response(status=status.HTTP_200_OK)
