from rest_framework.serializers import ModelSerializer
from dokumenti.models import InterniDokument

class InterniDokumentSerializer(ModelSerializer):
    class Meta:
        model = InterniDokument
        fields = '__all__'