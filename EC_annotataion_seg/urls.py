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
from django.urls import path,include,re_path
from annotate import views, tutorial_view


from annotate.dash_apps import simpleexample
from django.contrib.auth.views import LoginView

from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('',views.home),
    # path('login/',views.CustomLoginView.as_view(),name='login'),
    # path('login/',LoginView.as_view(template_name='registration/login.html'),name='login'),
    re_path(r'^login/$', LoginView.as_view(template_name='registration/login.html'), name='login'),
    # path('logout/',views.CustomLogoutView.as_view(),name='logout'),
    re_path(r'^logout/$', views.CustomLogoutView.as_view(), name='logout'),
    # re_path(r'^admin/$', admin.site.urls),
    path('admin/', admin.site.urls),
    path('django_plotly_dash/', include('django_plotly_dash.urls')),
    path('readImage/2ch',views.readImage2ch,name='readImage'),
    path('readImage/3ch',views.readImage3ch,name='readImage'),
    path('readImage/4ch',views.readImage4ch,name='readImage'),
    path('task/<int:task_index>',views.showAnnotationImage,name='readImage'),
    path('readImage/task/<int:task_index>/<int:frame_num>',views.AnnotationImage,name='readImage'),
    path('getAnnotationFromUNet/',views.getAnnotationFromUNet,name='getAnnotationFromUNet'),
    path('saveAnnotation/',views.saveAnnotation,name='saveAnnotation'),
    re_path(r'^tasks/$',views.GetTaskList,name='tasks'),
    path('tutorial/',tutorial_view.tutorial,name='tutorial'),
    path('tutorial/base',tutorial_view.tutorial_base,name='tutorial_base'),
    path('tutorial/ai',tutorial_view.tutorial_ai,name='tutorial_ai'),
    path('tutorial/key_points',tutorial_view.tutorial_key_points,name='tutorial_key_points'),
    path('tutorial/login_task',tutorial_view.tutorila_login_task,name='tutorial_login_task'),
]+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
