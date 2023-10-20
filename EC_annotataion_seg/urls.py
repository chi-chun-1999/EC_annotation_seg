"""
URL configuration for EC_annotataion_seg project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from annotate import views

from annotate.dash_apps import simpleexample


urlpatterns = [
    path('',views.home),
    path('admin/', admin.site.urls),
    path('django_plotly_dash/', include('django_plotly_dash.urls')),
    path('readImage/2ch',views.readImage2ch,name='readImage'),
    path('readImage/3ch',views.readImage3ch,name='readImage'),
    path('readImage/4ch',views.readImage4ch,name='readImage'),
    path('getAnnotationFromUNet/',views.getAnnotationFromUNet,name='getAnnotationFromUNet'),
    path('saveAnnotation/',views.saveAnnotation,name='saveAnnotation'),
]
