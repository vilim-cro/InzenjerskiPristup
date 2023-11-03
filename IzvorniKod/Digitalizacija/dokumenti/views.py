from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.contrib.auth import get_user
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import Ponuda

def index(request):
    user = get_user(request)
    if not user.is_authenticated:
       return HttpResponseRedirect(reverse('dokumenti:login'))
    groups = []
    for group in user.groups.all():
        groups.append(group)
    print(Ponuda.objects.get().ukupnaCijena)
    return render(request, 'dokumenti/index.html', {
        'tekst': groups
    })

def login_view(request):
    if request.method == 'POST':
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
    user = get_user(request)
    if user.is_authenticated:
       return HttpResponseRedirect(reverse('dokumenti:index'))
    return render(request, 'dokumenti/login.html')