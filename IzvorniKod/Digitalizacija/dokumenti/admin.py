from django.contrib import admin
from .models import Račun, Ponuda, InterniDokument, Artikl, SpecijalizacijaRačunovođe, NedefiniraniDokument, Dokument, PonudaArhivirana, RačunArhiviran, InterniDokumentArhiviran, NedefiniraniDokumentArhiviran

admin.site.register(Račun)
admin.site.register(Ponuda)
admin.site.register(InterniDokument)
admin.site.register(Artikl)
admin.site.register(SpecijalizacijaRačunovođe)
admin.site.register(NedefiniraniDokument)
admin.site.register(Dokument)
admin.site.register(PonudaArhivirana)
admin.site.register(RačunArhiviran)
admin.site.register(InterniDokumentArhiviran)
admin.site.register(NedefiniraniDokumentArhiviran)

