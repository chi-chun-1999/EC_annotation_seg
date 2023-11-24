from django.shortcuts import render
from plotly.offline import plot
import plotly.graph_objects as go
from PIL import Image
import io
import base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import numpy as np
from django.contrib.auth.decorators import login_required

@login_required
def tutorial(request):
    if request.user.is_authenticated:
        username = request.user.username
    return render(request, 'annotate/tutorial.html',locals())

@login_required
def tutorial_base(request):
    if request.user.is_authenticated:
        username = request.user.username
    return render(request, 'annotate/tutorial_base.html',locals())

def tutorial_ai(request):
    if request.user.is_authenticated:
        username = request.user.username
    return render(request, 'annotate/tutorial_ai.html',locals())

def tutorial_key_points(request):
    if request.user.is_authenticated:
        username = request.user.username
    return render(request, 'annotate/tutorial_key_points.html',locals())

def tutorila_login_task(request):
    if request.user.is_authenticated:
        username = request.user.username
    return render(request, 'annotate/tutorial_login_task.html',locals())




