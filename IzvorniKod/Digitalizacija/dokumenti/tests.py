from django.test import TestCase
from django.contrib.auth.models import User, Group
from django.test import Client
from .models import *
from .views import *


class ViewTest(TestCase):
    def setUp(self):
        Group.objects.create(name='Zaposlenici')
        Group.objects.create(name='Direktori')

        self.base_url = "/api/"
        self.zaposlenik = User.objects.create_user(username='test', password='test')
        Group.objects.get(name='Zaposlenici').user_set.add(self.zaposlenik)
        self.direktor = User.objects.create_user(username='test2', password='test2')
        Group.objects.get(name='Direktori').user_set.add(self.direktor)

        self.client = Client()
        self.zaposlenik_token = self.client.post(self.base_url + 'token/', {'username': 'test', 'password': 'test'}).data.get('access')
        self.direktor_token = self.client.post(self.base_url + 'token/', {'username': 'test2', 'password': 'test2'}).data.get('access')

        self.interni_dokument1 = InterniDokument.objects.create(tekstDokumenta='tekst 1', linkSlike='link 1', vrijemeSkeniranja='2021-05-05 10:10:10', korisnik=self.direktor)
        self.interni_dokument2 = InterniDokument.objects.create(tekstDokumenta='tekst 2', linkSlike='link 2', vrijemeSkeniranja='2021-05-05 10:10:10', korisnik=self.zaposlenik)


    # Testovi funckionalnosti korisnika

    def test_promijeni_lozinku(self):
        self.assertTrue(self.zaposlenik.check_password('test'))
        response = self.client.put(
            self.base_url + 'promijeniLozinku/',
            {"trenutnaLozinka": "test", "novaLozinka": "new_password"},
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )
        self.assertEquals(response.status_code, 200)
        self.zaposlenik.refresh_from_db()
        self.assertFalse(self.zaposlenik.check_password('test'))
        self.assertTrue(self.zaposlenik.check_password('new_password'))

    def test_dodaj_korisnika(self):
        response = self.client.post(
            self.base_url + 'dodajKorisnika/',
            {"username": "test3", "password": "test3", "email": ""},
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )
        self.assertEquals(response.status_code, 403)

        response = self.client.post(
            self.base_url + 'dodajKorisnika/',
            {"username": "test3", "password": "test3", "email": "abc@example.com", "ime": "test", "prezime": "test", "group": "Zaposlenici"},
            HTTP_AUTHORIZATION='Bearer ' + self.direktor_token,
            content_type='application/json'
        )
        self.assertEquals(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="test3").exists())
        user = User.objects.get(username="test3")
        self.assertTrue(Group.objects.get(name='Zaposlenici').user_set.filter(username="test3").exists())
        self.assertTrue(user.check_password('test3'))
        self.assertEquals(user.email, "abc@example.com")
        self.assertEquals(user.first_name, "test")
        self.assertEquals(user.last_name, "test")

    def test_dohvati_korisnike_grupe(self):
        response = self.client.get(
            self.base_url + 'dohvatiKorisnikeGrupe/Zaposlenici',
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['korisnici'], [{'id': self.zaposlenik.id, 'username': 'test'}])

        response = self.client.get(
            self.base_url + 'dohvatiKorisnikeGrupe/Direktori',
            HTTP_AUTHORIZATION='Bearer ' + self.direktor_token,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['korisnici'], [{'id': self.direktor.id, 'username': 'test2'}])


    # Testovi funkcionalnosti rada s dokumentima
        
    def test_moji_dokumenti(self):
        response = self.client.get(
            self.base_url + 'mojiDokumenti/',
            HTTP_AUTHORIZATION='Bearer ' + self.direktor_token,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['dokumenti']), 1)
        self.assertEqual(data['dokumenti'][0]['id'], self.interni_dokument1.id)

    def test_svi_dokumenti(self):
        response = self.client.get(
            self.base_url + 'sviDokumenti/',
            HTTP_AUTHORIZATION='Bearer ' + self.direktor_token,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['dokumenti']), 2)
        self.assertEqual(data['dokumenti'][0]['id'], self.interni_dokument1.id)
        self.assertEqual(data['dokumenti'][1]['id'], self.interni_dokument2.id)

    def test_označi_točnost_skeniranja(self):
        self.assertFalse(self.interni_dokument2.točnoSkeniran)
        response = self.client.put(
            self.base_url + 'označiTočnostSkeniranja/' + str(self.interni_dokument2.id),
            {"tocnost": True},
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.interni_dokument2.refresh_from_db()
        self.assertTrue(self.interni_dokument2.točnoSkeniran)

    def test_potpiši(self):
        self.assertFalse(self.interni_dokument1.potpisaoDirektor)
        response = self.client.put(
            self.base_url + 'potpiši/' + str(self.interni_dokument1.id),
            HTTP_AUTHORIZATION='Bearer ' + self.direktor_token,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.interni_dokument1.refresh_from_db()
        self.assertTrue(self.interni_dokument1.potpisaoDirektor)

    def test_dodijeli_revizora(self):
        revizori = Group.objects.create(name='Revizori')
        revizor = User.objects.create_user(username='test3', password='test3')
        revizori.user_set.add(revizor)

        self.assertIsNone(self.interni_dokument1.revizor)
        response = self.client.put(
            self.base_url + 'dodijeliRevizora/' + str(self.interni_dokument1.id),
            {"korisnik_id": revizor.id},
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.interni_dokument1.refresh_from_db()
        self.assertEqual(self.interni_dokument1.revizor, revizor)

        response = self.client.put(
            self.base_url + 'dodijeliRevizora/' + str(self.interni_dokument1.id),
            {"korisnik_id": self.direktor.id},
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.put(
            self.base_url + 'dodijeliRevizora/' + '0',
            {"korisnik_id": revizor.id},
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 404)

    def test_arhiviraj(self):
        Group.objects.create(name='Računovođe')
        računovođa = User.objects.create_user(username='test3', password='test3')
        Group.objects.get(name='Računovođe').user_set.add(računovođa)

        računovođa_token = self.client.post(self.base_url + 'token/', {'username': 'test3', 'password': 'test3'}).data.get('access')

        pk = self.interni_dokument1.pk
        tekst = self.interni_dokument1.tekstDokumenta
        self.assertTrue(InterniDokument.objects.filter(pk=pk).exists())
        self.assertFalse(InterniDokumentArhiviran.objects.filter(dokumentId=pk).exists())
        response = self.client.put(
            self.base_url + 'arhiviraj/' + str(self.interni_dokument1.id),
            HTTP_AUTHORIZATION='Bearer ' + računovođa_token,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(InterniDokument.objects.filter(pk=pk).exists())

        documents = InterniDokumentArhiviran.objects.filter(dokumentId=pk)
        self.assertTrue(documents.exists())
        self.assertTrue(len(documents) == 1)
        self.assertTrue(documents[0].tekstDokumenta == tekst)

    # Dodat jos testove za noviDokument i arhivu ne Internih dokumenata

        
