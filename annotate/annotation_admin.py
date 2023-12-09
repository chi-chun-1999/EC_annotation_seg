from .models import AnnotationData, ImageData, Polygons, SourceData
from .task_admin import TaskAdmin
from imantics import Polygons as ImanticsPolygons
from imantics import Mask as ImanticsMask
from PIL import Image
import json
import numpy as np
from django.conf import settings
# import matplotlib.pyplot as plt


class ExportAnnotationData:
    def __init__(self, annotation_data:AnnotationData) -> None:

        self._annotation_data = annotation_data
        self._image_data:ImageData = self._annotation_data.image_data
        self._source_data:SourceData = SourceData.objects.filter(imagedata=self._image_data)[0]

        self._view = self._annotation_data.view

        root_path = settings.TASK_STORE_ROOT_PATH
        
        
        if root_path[-1] == '/':
            self._image_path = root_path + self._source_data.file_dir + '/' + self._image_data.file_name
        else:
            self._image_path = root_path + '/' + self._source_data.file_dir + '/' + self._image_data.file_name

        self._polygons = Polygons.objects.filter(annotation_data=self._annotation_data)

    def export(self):
        export_data = {}
        polygons = []
        export_data['image_path'] = self._image_path
        export_data['view'] = self._view
        for p in self._polygons:
            polygon_data = {}
            polygon_data['area'] = p.area
            polygon_data['points'] = self.points2array(p.points)
            polygons.append(polygon_data)

        export_data['polygons'] = polygons

        return export_data

    def points2array(self,points):
        points_array = np.array([[i['x'],i['y']] for i in points])
        points_array = points_array.reshape(-1,2).tolist()
        return points_array

class AnnotationAdmin:
    def __init__(self) -> None:
        
        pass

    def exportFromTask(self, task_id):
        task_admin = TaskAdmin()
        task, source_data, image_list = task_admin.get_task(task_id)

    def export(self,mode,**kargs):
        """
        mode: 'task', 'view' and 't&v'
        """

        export_json = {}

        mode = mode.lower()
        if mode == 'task':
            task_id = kargs['task_id']
            task_admin = TaskAdmin()
            task, source_data, image_list = task_admin.get_task(task_id)
            export_data = []
            for image_data in image_list:
                annotation_data = AnnotationData.objects.filter(image_data=image_data)[0]
                export_data.append(ExportAnnotationData(annotation_data).export())

            export_json['mode'] = 'task'
            export_json['task_id'] = task_id
            export_json['data'] = export_data

        elif mode == 'view':
            view = kargs['view']
            annotation_data_list = AnnotationData.objects.filter(view=view)
            export_data = []
            for annotation_data in annotation_data_list:
                export_data.append(ExportAnnotationData(annotation_data).export())

            export_json['mode'] = 'view'
            export_json['view'] = view
            export_json['data'] = export_data


        elif mode == 't&v':
            task_id = kargs['task_id']
            view = kargs['view']
            task_admin = TaskAdmin()
            task, source_data, image_list = task_admin.get_task(task_id)
            export_data = []
            for image_data in image_list:
                annotation_data = AnnotationData.objects.filter(image_data=image_data, view=view)[0]
                export_data.append(ExportAnnotationData(annotation_data).export())

            export_json['mode'] = 't&v'
            export_json['task_id'] = task_id
            export_json['view'] = view
            export_json['data'] = export_data

        else:
            raise Exception('mode error')
        

        json_str = json.dumps(export_json, indent=4)

        # # store
        # with open('export.json', 'w') as f:
        #     f.write(json_str)


        return json_str



    def _polygon2mask(self, polygon: Polygons):
        area = polygon.area
        points = polygon.points
        polygon_array = np.array([[i['x'],i['y']] for i in points])
        polygon_array = polygon_array.reshape(-1,2)
        # np.save('polygon_array.npy', polygon_array)

        imantics_polygons = ImanticsPolygons(polygon_array)
        mask = imantics_polygons.mask(384,384)
        

        return mask

    def exportData2mask(self, export_json):
        export_data = export_json['data']

        for i in export_data:
            image_path = i['image_path']
            view = i['view']
            polygons = i['polygons']
            # mask = self._polygons2mask(polygons)

            area_list = [2,0,1]
            mask = np.zeros((384,384))


            for i in area_list:

                annot = polygons[i]
                area = annot['area']
                points = annot['points']
                polygon_array = np.array(points)
                polygon_array = polygon_array.reshape(-1,2)
                # np.save('polygon_array.npy', polygon_array)

                imantics_polygons = ImanticsPolygons(polygon_array)
                if area == 'LV':
                    mask = mask + imantics_polygons.mask(384,384)*1
                elif area == 'LA':
                    tmp_mask = imantics_polygons.mask(384,384)*2
                    mask = mask + tmp_mask
                elif area == 'RA':
                    tmp_mask = imantics_polygons.mask(384,384)*3
                    mask = mask + tmp_mask

            print(mask.shape)
            plt.imshow(mask)
            break


            # mask.save(image_path.replace('.jpg',f'_{view}.png'))
        
        # return mask

    


