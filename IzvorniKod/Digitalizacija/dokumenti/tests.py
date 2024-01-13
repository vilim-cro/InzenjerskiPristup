from django.test import TestCase, Client
from django.contrib.auth.models import User, Group
from .models import *
from .views import *
from django.utils import timezone
import pytz
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import unittest
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoAlertPresentException
from selenium.webdriver.common.keys import Keys

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

        self.interni_dokument1 = InterniDokument.objects.create(tekstDokumenta='tekst 1', linkSlike='link 1', vrijemeSkeniranja=timezone.datetime(2021, 5, 5, 10, 10, 10, tzinfo=pytz.UTC), korisnik=self.direktor)
        self.interni_dokument2 = InterniDokument.objects.create(tekstDokumenta='tekst 2', linkSlike='link 2', vrijemeSkeniranja=timezone.datetime(2021, 5, 5, 10, 10, 10, tzinfo=pytz.UTC), korisnik=self.zaposlenik)


    # Testovi funckionalnosti korisnika

    def test_promijeni_lozinku(self):
        self.assertTrue(self.zaposlenik.check_password('test'))

        response = self.client.put(
            self.base_url + 'promijeniLozinku/',
            {"trenutnaLozinka": "test", "novaLozinka": "test"},
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )
        self.assertEquals(response.status_code, 418)

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
            {"username": "test3", "password": "test3"},
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

    def test_dohvati_specijalizirane_racunovodje(self):
        Group.objects.create(name='Računovođe')
        računovođa = User.objects.create_user(username='test3', password='test3')
        Group.objects.get(name='Računovođe').user_set.add(računovođa)

        SpecijalizacijaRačunovođe.objects.create(korisnik=računovođa, tipSpecijalizacije=0)

        response = self.client.get(
            self.base_url + 'dohvatiSpecijaliziraneRačunovođe/abc',
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.get(
            self.base_url + 'dohvatiSpecijaliziraneRačunovođe/Računi',
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['korisnici'], [{'id': računovođa.id, 'username': 'test3'}])

        response = self.client.get(
            self.base_url + 'dohvatiSpecijaliziraneRačunovođe/Ponude',
            HTTP_AUTHORIZATION='Bearer ' + self.zaposlenik_token,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['korisnici'], [])


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


class SeleniumTests(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000/#/")

    def login(self, username, password):
        username_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        password_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "password"))
        )
        login_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, ":r5:"))
        )

        username_form.send_keys(username)
        password_form.send_keys(password)
        login_button.click()

    def change_password(self, old_password, new_password):
        options = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[aria-label='Otvori postavke']"))
        )
        options.click()

        buttons = WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul[role='menu'] li"))
        )
        change_password_button = [b for b in buttons if b.text == "Promijeni lozinku"][0]
        change_password_button.click()
        
        current_password_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "currentPassword"))
        )
        new_password_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "newPassword"))
        )
        submit_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "button[type='submit']"))
        )
        current_password_form.send_keys(old_password)
        new_password_form.send_keys(new_password)
        submit_button.click()

    def handle_alert(self, alert_message):
        try:
            alert = self.driver.switch_to.alert
            self.assertEqual(alert.text, alert_message)
            alert.accept()
        except NoAlertPresentException:
            self.fail("No alert present")

    def clear_form(self):
        inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='password'], input[type='email']")
        for inp in inputs:
            inp.click()
            while inp.get_attribute('value') != "":
                inp.send_keys(Keys.BACK_SPACE)

    def add_user(self, name, surname, email, username, password):
        name_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "ime"))
        )
        surname_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "prezime"))
        )
        email_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        username_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        password_form = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "password"))
        )
        submit_button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, ":rl:"))
        )

        name_form.send_keys(name)
        surname_form.send_keys(surname)
        email_form.send_keys(email)
        username_form.send_keys(username)
        password_form.send_keys(password)

        time.sleep(1)

        submit_button.click()

    def test_login_fail(self):
        self.login("zaposlenik1", "a")
        time.sleep(1)
        self.handle_alert("Pogrešno korisničko ime ili lozinka")

    def test_login_and_logout(self):
        self.login("zaposlenik1", "12qwasyx")

        options = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[aria-label='Otvori postavke']"))
        )
        options.click()

        time.sleep(1)

        buttons = WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul[role='menu'] li"))
        )
        logout_button = [b for b in buttons if b.text == "Odjavi se"][0]
        logout_button.click()

        self.assertEqual(self.driver.current_url, "http://localhost:3000/#/login")

    def test_change_password(self):
        self.login("zaposlenik1", "12qwasyx")
        time.sleep(1)

        # Wrong current password
        self.change_password("a", "yxasqw12")
        time.sleep(1)
        self.handle_alert("Unesite ispravnu trenutnu lozinku")
        self.assertTrue(User.objects.get(username="zaposlenik1").check_password("12qwasyx"))

        time.sleep(1)
        self.clear_form()

        # New password same as old one
        self.change_password("12qwasyx", "12qwasyx")
        time.sleep(1)
        self.handle_alert("Nova lozinka mora biti različita od stare")
        self.assertTrue(User.objects.get(username="zaposlenik1").check_password("12qwasyx"))

        time.sleep(1)
        self.clear_form()

        # Succesful password change
        self.change_password("12qwasyx", "yxasqw12")
        time.sleep(1)
        self.handle_alert("Lozinka uspješno promijenjena")
        self.assertTrue(User.objects.get(username="zaposlenik1").check_password("yxasqw12"))

        # Change password back to original
        self.change_password("yxasqw12", "12qwasyx")
        time.sleep(1)
        self.handle_alert("Lozinka uspješno promijenjena")
        self.assertTrue(User.objects.get(username="zaposlenik1").check_password("12qwasyx"))

    def test_add_new_employee(self):
        self.login("direktor1", "12qwasyx")
        class_name = "css-1q39md6-MuiButtonBase-root-MuiButton-root"
        buttons = WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, class_name))
        )
        new_employee_button = [b for b in buttons if b.text == "DODAJ NOVOG ZAPOSLENIKA"][0]
        new_employee_button.click()

        # Wrong user creation, username already exists
        self.add_user("test", "test", "test@gmail.com", "zaposlenik1", "test")
        time.sleep(1)
        self.handle_alert("Greška prilikom dodavanja zaposlenika")

        self.clear_form()
        time.sleep(1)

        # Successfull user creation
        user = "ivan_horvat"
        self.add_user("test", "test", "test@gmail.com", user, "test")
        time.sleep(1)
        self.handle_alert("Zaposlenik uspješno dodan")

        self.assertTrue(User.objects.filter(username=user).exists())
        self.assertTrue(User.objects.get(username=user).check_password("test"))
        self.assertTrue(Group.objects.get(name='Zaposlenici').user_set.filter(username=user).exists())

        User.objects.get(username=user).delete()
        self.assertTrue(not User.objects.filter(username=user).exists())

    def tearDown(self):
        self.driver.close()
