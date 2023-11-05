from django.shortcuts import render
from plotly.offline import plot
import plotly.graph_objects as go
from PIL import Image
import io
import base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import numpy as np
from imantics import Polygons, Mask
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from .task_admin import TaskAdmin, TaskImageAdmin
from .models import AnnotationData, Polygons, Task
import json
from django.template import RequestContext






# Create your views here.

def home(request):
    hello = 'Hello World!'

    if request.user.is_authenticated:
        username = request.user.username
    return render(request, 'annotate/index.html', locals())

def handler404(request):
    return render(request, '404.html', locals())


@login_required
def GetTaskList(request):
    if request.user.is_authenticated:
        username = request.user.username
    task_admin = TaskAdmin()
    task_list, show_image_list = task_admin.get_task_list()
    
    show= [{'task':task_list[i],'show_image':show_image_list[i]} for i in range(len( task_list))]
    

    return render(request, 'annotate/tasks.html', locals())

class CustomLoginView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True

class CustomLogoutView(LogoutView):
    template_name = 'logout.html'
    redirect_authenticated_user = True


@login_required
@csrf_exempt
def showAnnotationImage(request,task_index):
    if request.user.is_authenticated:
        username = request.user.username
    task_admin = TaskAdmin()
    task, source_data, img_data_list = task_admin.get_task(task_index)
    # print('----------->',request.method)

    if request.method == 'GET':

        if task_index == []:
            return render(request, 'annotate/readImage.html',locals())
        
        else:
        
            task_image_admin = TaskImageAdmin(img_data_list)

            image_num = len(img_data_list)

            stop_frame = task.stop_frame
            task_index = task.id
            
            image = task_image_admin.get_image(stop_frame)
            ioBuffer = io.BytesIO()
            image.save(ioBuffer, format='PNG')
            data = base64.b64encode(ioBuffer.getvalue()).decode('utf-8')

            frame_information = []
            
            for i in img_data_list:

                tmp_annotation_data = AnnotationData.objects.filter(image_data=i)

                if len(tmp_annotation_data) == 0:
                    tmp_polygons = {'LAM':[],'LA':[],'LVM':[],'LV':[]}
                    tmp_information = {'key_points':{},'view':'','polygon_area':tmp_polygons}
                    frame_information.append(tmp_information)

                else:
                    tmp_polygons = Polygons.objects.filter(annotation_data=tmp_annotation_data[0])
                    tmp_polygons = {i.area:i.points for i in tmp_polygons}
                    tmp_information = {'key_points':tmp_annotation_data[0].key_points,'view':tmp_annotation_data[0].view,'polygon_area':tmp_polygons}
                    frame_information.append(tmp_information)

            frame_information = json.dumps(frame_information)
        return render(request, 'annotate/annotation.html',locals())

    if request.method == "POST":
        stop_frame = request.POST.get('stop_frame')
        task_index = request.POST.get('task_index')
        # print('stop_frame',stop_frame)
        # print('task_index',task_index)
        
        # update task data
        Task.objects.filter(id=task_index).update(stop_frame=stop_frame)
        return JsonResponse({'success':True})

        
        
                




@csrf_exempt
def AnnotationImage(request,task_index,frame_num):
    if request.method == 'GET':
        task_admin = TaskAdmin()
        task, source_data, img_data_list = task_admin.get_task(task_index)
        task_image_admin = TaskImageAdmin(img_data_list)

        image = task_image_admin.get_image(frame_num) # PIL Image
        ioBuffer = io.BytesIO()
        image.save(ioBuffer, format='PNG')
        data = base64.b64encode(ioBuffer.getvalue()).decode('utf-8')

        annotation_data = AnnotationData.objects.filter(image_data=img_data_list[frame_num])
        polygons_response = {}

        # if len(annotation_data)!=0:
        #     polygons_from_dataset = Polygons.objects.filter(annotation_data=annotation_data[0])
        #     print(polygons_from_dataset)
        #     if len(polygons_from_dataset)!=0:
        #         for i in polygons_from_dataset:
        #             polygons_response[i.area] = i.points
        #     else:
        #         area = ['LAM','LA','LVM','LV']
        #         for i in area:
        #             polygons_response[i] = []

        return JsonResponse({'data':data,'polygons':polygons_response,'success':True})

    if request.method == 'POST':
        try:
            decode_polygons = json.loads(request.POST.get('polygons'))
            view = json.loads(request.POST.get('view'))
            key_points = json.loads(request.POST.get('key_points'))

            task_admin = TaskAdmin()
            task, source_data, img_data_list = task_admin.get_task(task_index)

            annotation_data = AnnotationData.objects.filter(image_data=img_data_list[frame_num])
            print(annotation_data)
            print(len(img_data_list))
            if len(annotation_data) == 0:
                print('create')
                # print('------------------->')
                # print('polygons-------->',json.loads(polygons))
                # decode_polygons = json.loads(polygons_from_request)
                tmp_annotation_data = AnnotationData.objects.create(image_data=img_data_list[frame_num],view=view,key_points=key_points)
                
                # print(tmp_annotation_data)
                area = ['LAM','LA','LVM','LV']

                for i in area:
                    tmp_polygons = Polygons.objects.create(area=i,points=decode_polygons[i],annotation_data=tmp_annotation_data)
                    # print(tmp_polygons)
                    # print(area)
                    print(i,'polygons-------->',decode_polygons[i])

            else:
                print('update')
                # print(view,key_points)
                # print(annotation_data[0])

                # annotation_data[0].update(view=view,key_points=key_points)
                annotation_data[0].key_points = key_points
                annotation_data[0].view = view
                annotation_data[0].save()
                # print('---->',annotation_data[0].view,annotation_data[0].key_points)

                polygons_from_dataset = Polygons.objects.filter(annotation_data=annotation_data[0])



                area = ['LAM','LA','LVM','LV']

                for i in area:
                    # decode_polygons = json.loads(polygons_from_request)

                    polygons_from_dataset.filter(area=i).update(points=decode_polygons[i])
                    # print(i,'polygons-------->',decode_polygons[i])
            # print('polygons-------->',polygons)
            # print('view------------>',view)
            
            # annotation_data = AnnotationData.objects.filter(image_data=img_data_list[frame_num])
            # print(annotation_data)
            # print('------finish---------->')

            return JsonResponse({'success':True})
        except Exception as e:
            return JsonResponse({'error':str(e)})
        



@login_required
def readImage3ch(request):
    
    if request.user.is_authenticated:
        username = request.user.username
    
    image = Image.open('annotate/statics/kmu_3ch_test.jpg')
    print(image.size)
    ioBuffer = io.BytesIO()
    image.save(ioBuffer, format='PNG')
    data = base64.b64encode(ioBuffer.getvalue()).decode('utf-8')

    return render(request, 'annotate/readImage.html',locals())

@login_required
def readImage2ch(request):
    if request.user.is_authenticated:
        username = request.user.username
    
    image = Image.open('annotate/statics/kmu_2ch_test.png')
    ioBuffer = io.BytesIO()
    image.save(ioBuffer, format='PNG')
    data = base64.b64encode(ioBuffer.getvalue()).decode('utf-8')

    return render(request, 'annotate/readImage.html',locals())

@login_required
def readImage4ch(request):
    if request.user.is_authenticated:
        username = request.user.username
    
    image = Image.open('annotate/statics/kmu_4ch_test.png')
    ioBuffer = io.BytesIO()
    image.save(ioBuffer, format='PNG')
    data = base64.b64encode(ioBuffer.getvalue()).decode('utf-8')

    return render(request, 'annotate/readImage.html',locals())


@csrf_exempt
def getAnnotationFromUNet(request):

    if request.method == 'GET':
        try:
            annotate = np.load('annotate/statics/kmu_a4c_A41HII82_frame2_mask.npy')


            annotate_polygons_lv = Mask(annotate==1).polygons()
            annotate_polygons_la = Mask(annotate==3).polygons()    

            tmp = [len(i) for i in annotate_polygons_la.points]
            la_polygon_points = annotate_polygons_la.points[tmp.index(max(tmp))]
            tmp = [len(i) for i in annotate_polygons_lv.points]
            lv_polygon_points = annotate_polygons_lv.points[tmp.index(max(tmp))]
            
            return JsonResponse({'la_polygon_points':la_polygon_points.tolist(),'lv_polygon_points':lv_polygon_points.tolist(),'success':True})
        except Exception as e:
            return JsonResponse({'error':str(e)})
    else:
        return JsonResponse({'error':'Invalid Request'})
    
    
    # return JsonResponse({'annotation':annotate.tolist()})




@csrf_exempt
def saveAnnotation(request):
    if request.method == 'POST':
        try:
            polygon_data = request.POST.get('annotationPoints')
            print(polygon_data)
            return JsonResponse({'success':True})
        except Exception as e:
            return JsonResponse({'error':str(e)})

    else:
        return JsonResponse({'error':'Invalid Request'})

