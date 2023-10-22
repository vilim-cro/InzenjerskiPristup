from django.shortcuts import render

def index(request):
    return render(request, 'dokumenti/index.html', {
        'kontekst': 'Ovo je kontekst',
    })