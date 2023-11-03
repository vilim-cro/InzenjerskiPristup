from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum

class Dokument(models.Model):
    tekstDokumenta = models.TextField()
    linkSlike = models.CharField(max_length=400)
    vrijemeSkeniranja = models.DateTimeField()
    skeniraoKorisnik = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_skenirao_dokument", limit_choices_to={'groups__name': "Zaposlenici"})
    potvrdioRevizor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_potvrdio_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Revizori"})
    potpisaoDirektor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_potpisao_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Direktori"})
    pregledaoRačunovođa = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_pregledao_dokument", null=True, blank=True, limit_choices_to={'groups__name': "Računovođe"})

    class Meta:
        verbose_name_plural = "Dokumenti"
        abstract = True

    def __str__(self):
        return self.tekstDokumenta

class Artikl(models.Model):
    imeArtikla = models.CharField(max_length=50)
    cijenaArtikla = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name_plural = "Artikli"

    def __str__(self):
        return self.imeArtikla

class Ponuda(Dokument):
    artikli = models.ManyToManyField('Artikl')

    @property
    def ukupnaCijena(self):
        return self.artikli.aggregate(
            ukupnaCijena=Sum('cijenaArtikla')
            )['ukupnaCijena']

    class Meta:
        verbose_name_plural = "Ponude"

    def __str__(self):
        return "Ponuda iznosa " + str(self.ukupnaCijena)

class Račun(Dokument):
    imeKlijenta = models.CharField(max_length=30)
    artikli = models.ManyToManyField('Artikl')

    @property
    def ukupnaCijena(self):
        return self.artikli.aggregate(
            ukupnaCijena=Sum('cijenaArtikla')
            )['ukupnaCijena']

    class Meta:
        verbose_name_plural = "Računi"

    def __str__(self):
        return "Račun za " + self.imeKlijenta + " iznosa " + str(self.ukupnaCijena)

class InterniDokument(Dokument):
    class Meta:
        verbose_name_plural = "Interni Dokumenti"

class SpecijalizacijaRačunovođe(models.Model):
    izborSpecijalizacije = (
        (0, 'Računi'),
        (1, 'Ponude'),
        (2, 'InterniDokumenti')
    )
    korisnik = models.ForeignKey(User, on_delete=models.CASCADE, related_name="specijalizacije", limit_choices_to={'groups__name': "Računovođe"})
    tipSpecijalizacije = models.IntegerField(choices=izborSpecijalizacije)

    class Meta:
        verbose_name_plural = "Specijalizacije Računovođe"

    def __str__(self):
        return self.korisnik.username + " - " + self.izborSpecijalizacije[self.tipSpecijalizacije][1]
