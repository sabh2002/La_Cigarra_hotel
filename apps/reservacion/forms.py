from django.forms import ModelForm

from apps.reservacion.models import PrecioDolar

class DolarForm(ModelForm):
    class Meta:
        model = PrecioDolar
        fields = '__all__'