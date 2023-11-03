from django.contrib import admin
from .models import Račun, Ponuda, InterniDokument, Artikl, SpecijalizacijaRačunovođe

admin.site.register(Račun)
admin.site.register(Ponuda)
admin.site.register(InterniDokument)
admin.site.register(Artikl)
admin.site.register(SpecijalizacijaRačunovođe)
