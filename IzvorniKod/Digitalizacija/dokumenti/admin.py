from django.contrib import admin
from .models import Račun, Ponuda, InterniDokument, Artikl, SpecijalizacijaRačunovođe, NedefiniraniDokument

admin.site.register(Račun)
admin.site.register(Ponuda)
admin.site.register(InterniDokument)
admin.site.register(Artikl)
admin.site.register(SpecijalizacijaRačunovođe)
admin.site.register(NedefiniraniDokument)
