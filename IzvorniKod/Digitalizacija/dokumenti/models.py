from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum

class Dokument(models.Model):
    tekstDokumenta = models.TextField()
    linkSlike = models.CharField(max_length=400)
    vrijemeSkeniranja = models.DateTimeField()
    korisnik = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_skenirao_dokument", limit_choices_to={'groups__name': "Zaposlenici"})
    revizor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_potvrdio_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Revizori"})
    računovođa = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_pregledao_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Računovođe"})
    direktor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_potpisao_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Direktori"})

    točnoSkeniran = models.BooleanField(null=True, blank=True)
    potvrdioRevizor = models.BooleanField(default=False)
    pregledaoRačunovođa = models.BooleanField(default=False)
    potpisaoDirektor = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "tekstDokumenta": self.tekstDokumenta,
            "linkSlike": self.linkSlike,
            "vrijemeSkeniranja": self.vrijemeSkeniranja.strftime("%d/%m/%Y %H:%M:%S"),
            "korisnik": self.korisnik.username,
            "revizor": self.revizor.username if self.revizor is not None else None,
            "direktor": self.direktor.username if self.direktor is not None else None,
            "računovođa": self.računovođa.username if self.računovođa is not None else None,
            "potvrdioRevizor": self.potvrdioRevizor,
            "pregledaoRačunovođa": self.pregledaoRačunovođa,
            "potpisaoDirektor": self.potpisaoDirektor
        }

    class Meta:
        verbose_name_plural = "Dokumenti"
        abstract = True

    def __str__(self):
        return self.tekstDokumenta if len(self.tekstDokumenta) < 50 else self.tekstDokumenta[:50] + "..."

class Artikl(models.Model):
    imeArtikla = models.CharField(max_length=50)
    cijenaArtikla = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def serialize(self):
        return {
            "id": self.id,
            "imeArtikla": self.imeArtikla,
            "cijenaArtikla": self.cijenaArtikla
        }

    class Meta:
        verbose_name_plural = "Artikli"

    def __str__(self):
        return self.imeArtikla

class Ponuda(Dokument):
    artikli = models.ManyToManyField('Artikl')
    ukupnaCijena = models.DecimalField(max_digits=100, decimal_places=2, default=0)

    @property
    def izracunajCijenu(self):
        return self.artikli.aggregate(
            ukupnaCijena=Sum('cijenaArtikla')
            )['ukupnaCijena']

    def serialize(self):
        dictionary = super().serialize()
        dictionary["artikli"] = [artikl.serialize() for artikl in self.artikli.all()]
        dictionary["ukupnaCijena"] = self.ukupnaCijena
        return dictionary

    class Meta:
        verbose_name_plural = "Ponude"

    def __str__(self):
        return "Ponuda iznosa " + str(self.ukupnaCijena)

class Račun(Dokument):
    imeKlijenta = models.CharField(max_length=30)
    ukupnaCijena = models.DecimalField(max_digits=100, decimal_places=2, default=0)
    artikli = models.ManyToManyField('Artikl')

    @property
    def izracunajCijenu(self):
        return self.artikli.aggregate(
            ukupnaCijena=Sum('cijenaArtikla')
            )['ukupnaCijena']

    def serialize(self):
        dictionary = super().serialize()
        dictionary["imeKlijenta"] = self.imeKlijenta
        dictionary["artikli"] = [artikl.serialize() for artikl in self.artikli.all()]
        dictionary["ukupnaCijena"] = self.ukupnaCijena
        return dictionary

    class Meta:
        verbose_name_plural = "Računi"

    def __str__(self):
        return "Račun za " + self.imeKlijenta + " iznosa " + str(self.ukupnaCijena)

class InterniDokument(Dokument):
    def serialize(self):
        return super().serialize()

    class Meta:
        verbose_name_plural = "Interni Dokumenti"

class NedefiniraniDokument(Dokument):
    def serialize(self):
        return super().serialize()

    class Meta:
        verbose_name_plural = "Nedefinirani Dokumenti"

class SpecijalizacijaRačunovođe(models.Model):
    izborSpecijalizacije = (
        (0, 'Računi'),
        (1, 'Ponude'),
        (2, 'InterniDokumenti')
    )
    korisnik = models.ForeignKey(User, on_delete=models.CASCADE, related_name="specijalizacije", limit_choices_to={'groups__name': "Računovođe"})
    tipSpecijalizacije = models.IntegerField(choices=izborSpecijalizacije)

    def serialize(self):
        return {
            "id": self.id,
            "korisnik": self.korisnik.username,
            "tipSpecijalizacije": self.izborSpecijalizacije[self.tipSpecijalizacije][1]
        }

    class Meta:
        verbose_name_plural = "Specijalizacije Računovođe"

    def __str__(self):
        return self.korisnik.username + " - " + self.izborSpecijalizacije[self.tipSpecijalizacije][1]

class Arhiva(models.Model):
    tekstDokumenta = models.TextField()
    linkSlike = models.CharField(max_length=400)
    vrijemeSkeniranja = models.DateTimeField()
    dokumentId = models.IntegerField()
    vrijemeArhiviranja = models.DateTimeField()
    korisnik = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_skenirao_dokument", limit_choices_to={'groups__name': "Zaposlenici"})
    revizor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_potvrdio_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Revizori"})
    računovođa = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_pregledao_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Računovođe"})
    direktor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_potpisao_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Direktori"})

    potvrdioRevizor = models.BooleanField(default=False)
    pregledaoRačunovođa = models.BooleanField(default=False)
    potpisaoDirektor = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "tekstDokumenta": self.tekstDokumenta,
            "linkSlike": self.linkSlike,
            "vrijemeSkeniranja": self.vrijemeSkeniranja.strftime("%d/%m/%Y %H:%M:%S"),
            "vrijemeArhiviranja": self.vrijemeArhiviranja.strftime("%d/%m/%Y %H:%M:%S"),
            "dokumentId": self.dokumentId,
            "korisnik": self.korisnik.username,
            "revizor": self.revizor.username if self.revizor is not None else None,
            "direktor": self.direktor.username if self.direktor is not None else None,
            "računovođa": self.računovođa.username if self.računovođa is not None else None,
            "potvrdioRevizor": self.potvrdioRevizor,
            "pregledaoRačunovođa": self.pregledaoRačunovođa,
            "potpisaoDirektor": self.potpisaoDirektor
        }

    class Meta:
        verbose_name_plural = "Arhive"
        abstract = True

    def __str__(self):
        return self.tekstDokumenta if len(self.tekstDokumenta) < 50 else self.tekstDokumenta[:50] + "..."

class PonudaArhivirana(Arhiva):
    artikli = models.ManyToManyField('Artikl')
    ukupnaCijena = models.DecimalField(max_digits=100, decimal_places=2, default=0)

    @property
    def izracunajCijenu(self):
        return self.artikli.aggregate(
            ukupnaCijena=Sum('cijenaArtikla')
            )['ukupnaCijena']

    def serialize(self):
        dictionary = super().serialize()
        dictionary["artikli"] = [artikl.serialize() for artikl in self.artikli.all()]
        dictionary["ukupnaCijena"] = self.ukupnaCijena
        return dictionary

    class Meta:
        verbose_name_plural = "Arhivirane ponude"

    def __str__(self):
        return "Ponuda iznosa " + str(self.ukupnaCijena)

class RačunArhiviran(Arhiva):
    imeKlijenta = models.CharField(max_length=30)
    ukupnaCijena = models.DecimalField(max_digits=100, decimal_places=2, default=0)
    artikli = models.ManyToManyField('Artikl')

    @property
    def izracunajCijenu(self):
        return self.artikli.aggregate(
            ukupnaCijena=Sum('cijenaArtikla')
            )['ukupnaCijena']

    def serialize(self):
        dictionary = super().serialize()
        dictionary["imeKlijenta"] = self.imeKlijenta
        dictionary["artikli"] = [artikl.serialize() for artikl in self.artikli.all()]
        dictionary["ukupnaCijena"] = self.ukupnaCijena
        return dictionary

    class Meta:
        verbose_name_plural = "Arhivirani računi"

    def __str__(self):
        return "Račun za " + self.imeKlijenta + " iznosa " + str(self.ukupnaCijena)

class InterniDokumentArhiviran(Arhiva):
    def serialize(self):
        return super().serialize()

    class Meta:
        verbose_name_plural = "Arhivirani interni dokumenti"

class NedefiniraniDokumentArhiviran(Arhiva):
    def serialize(self):
        return super().serialize()

    class Meta:
        verbose_name_plural = "Arhivirani nedefinirani dokumenti"