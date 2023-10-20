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


# Create your views here.

def home(request):
    hello = 'Hello World!'

    def scatter():
        x1 = [1, 2, 3, 4, 5]
        y1 = [1, 2, 4, 8, 16]

        trace1 = go.Scatter(
            x=x1,
            y=y1,
            mode='lines+markers',
            name='linear',
            line=dict(
                shape='linear'
            )
        )

        layout = dict(
            title='Linear',
            xaxis=dict(range=[min(x1), max(x1)]),
            yaxis=dict(range=[min(y1), max(y1)]),
                )
        fig = go.Figure(data=[trace1], layout=layout)
        plot_div = plot(fig, output_type='div', include_plotlyjs=False)
        return plot_div

    context ={
        'plot1': scatter()
    }

    return render(request, 'annotate/index.html', context)

def readImage3ch(request):
    
    image = Image.open('annotate/statics/kmu_3ch_test.jpg')
    ioBuffer = io.BytesIO()
    image.save(ioBuffer, format='PNG')
    data = base64.b64encode(ioBuffer.getvalue()).decode('utf-8')

    return render(request, 'annotate/readImage.html',locals())

def readImage2ch(request):
    
    image = Image.open('annotate/statics/kmu_2ch_test.png')
    ioBuffer = io.BytesIO()
    image.save(ioBuffer, format='PNG')
    data = base64.b64encode(ioBuffer.getvalue()).decode('utf-8')

    return render(request, 'annotate/readImage.html',locals())

def readImage4ch(request):
    
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

