"""
usage:
    python3 manage.py shell < export_data.py
"""


from annotate.annotation_admin import AnnotationAdmin
import json
from annotate.models import Task

from django.conf import settings 
from imantics import Polygons as ImanticsPolygons
from imantics import Mask as ImanticsMask
from PIL import Image
import numpy as np
import cv2 as cv
import os

def exportDataWithMask(export_json,show_root_path,sub_dir):
    export_data = export_json['data']

    if os.path.exists(show_root_path) == False:
        os.makedirs(show_root_path)

    task_root_path = settings.TASK_STORE_ROOT_PATH
    if task_root_path[-1] == '/':
        ori_img_root_path = task_root_path+sub_dir+'/'
    else:
        ori_img_root_path = task_root_path+'/'+sub_dir+'/'

        

    for i in export_data:
        image_path = i['image_path']
        view = i['view']
        polygons = i['polygons']

        export_file_name = image_path.split('/')[-1]

        ori_img_path = ori_img_root_path+export_file_name
        ori_img = Image.open(ori_img_path)
        show_img = np.array(ori_img)
        show_img = cv.cvtColor(show_img, cv.COLOR_BGR2RGB)


        if show_root_path[-1] == '/':
            show_path = show_root_path+  export_file_name
        else:
            show_path = show_root_path+'/'+ export_file_name

        area_list = [2,0,1]
        mask = np.zeros((384,384), dtype=np.uint8)

        save_file = True

        for i in area_list:
            annot = polygons[i]
            area = annot['area']
            points = annot['points']

            if len(points) == 0:
                save_file = False
                break

            polygon_array = np.array(points)
            polygon_array = polygon_array.reshape(-1,2)


            imantics_polygons = ImanticsPolygons([polygon_array])

            if area == 'LV':
                show_img = imantics_polygons.draw(show_img, color=(255, 0, 0),thickness=1)

            elif area == 'LA':
                show_img = imantics_polygons.draw(show_img, color=(0, 255, 0),thickness=1)

            elif area == 'LAM':
                show_img = imantics_polygons.draw(show_img, color=(0, 0, 255),thickness=1)

        if save_file:
            Image.fromarray(show_img).save(show_path)



def exportData2mask(export_json,root_path):
    export_data = export_json['data']
    if os.path.exists(root_path) == False:
        os.makedirs(root_path)
    
    tmp_img = export_data[0]['image_path']
    tmp_img = Image.open(tmp_img)
    tmp_img_size = tmp_img.size

    for i in export_data:
        image_path = i['image_path']
        view = i['view']
        polygons = i['polygons']
        # mask = self._polygons2mask(polygons)
        export_file_name = image_path.split('/')[-1]
        
        
        if root_path[-1] == '/':
            export_path = root_path+  export_file_name
        else:
            export_path = root_path+'/'+ export_file_name
        

        area_list = [1,0,2]
        mask = np.zeros((tmp_img_size[1],tmp_img_size[0]), dtype=np.uint8)
        save_file = True


        for i in area_list:

            annot = polygons[i]
            area = annot['area']
            points = annot['points']

            if len(points) == 0:
                save_file = False
                break


            polygon_array = np.array(points)
            polygon_array = polygon_array.reshape(-1,2)

            imantics_polygons = ImanticsPolygons([polygon_array])
            # print(type(imantics_polygons.mask(384,384).array))
            if area == 'LV':
                mask[imantics_polygons.mask(tmp_img_size[0],tmp_img_size[1]).array] = 1

            elif area == 'LA':
                tmp_mask = imantics_polygons.mask(tmp_img_size[0],tmp_img_size[1]).array
                mask[tmp_mask]=2

            elif area == 'LAM':
                tmp_mask = imantics_polygons.mask(tmp_img_size[0],tmp_img_size[1]).array
                mask[tmp_mask]=3
            


        
        if save_file:
            Image.fromarray(mask).save(export_path)
            

        # img.save('test_mask.png')
    # return mask


task_id = 12
mask_root_path = '/mnt/chi-chun/data1t/mask/a2c_unregular/'
show_root_path = '/mnt/chi-chun/data1t/show_mask/a2c_unregular/'
task = Task.objects.get(id=task_id)
source_data = task.source_data

# print(source_data.file_dir)

# print(settings.TASK_STORE_ROOT_PATH)


annotation_admin = AnnotationAdmin()
export_data_str = annotation_admin.export(mode='task',task_id=task_id)

export_data = json.loads(export_data_str)


exportData2mask(export_data,mask_root_path)
exportDataWithMask(export_data,show_root_path,source_data.file_dir)

# print(export_data['task_id'])



