from rest_framework.serializers import ModelSerializer
from dokumenti.models import InterniDokument, Račun, Ponuda

class InterniDokumentSerializer(ModelSerializer):
    class Meta:
        model = InterniDokument
        fields = '__all__'

class RačunSerializer(ModelSerializer):
    class Meta:
        model = Račun
        fields = '__all__'

class PonudaSerializer(ModelSerializer):
    class Meta:
        model = Ponuda
        fields = '__all__'