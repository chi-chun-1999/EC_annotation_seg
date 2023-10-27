from .models import Task, SourceData, ImageData
from django.conf import  settings
import os,sys
from PIL import Image




class TaskAdmin():
    def __init__(self):
        pass
    def add_task(self,task_name,sub_dir):
        # print(settings.TASK_STORE_PATH)
        png_list = self._get_source_data_file_list(sub_dir)
        file_num = len(png_list)

        self._source_data = SourceData.objects.create(file_num=file_num,file_dir=sub_dir)
        self._task = Task.objects.create(name=task_name,source_data=self._source_data)

        for png in png_list:
            file_name = os.path.basename(png)
            research_id = file_name.split('_')[0]
            frame_num_from_ori = file_name.split('_')[2].split('.')[0]
            image_data = ImageData.objects.create(file_name=file_name,research_id=research_id,frame_num_from_ori=frame_num_from_ori,source_data=self._source_data)

            image_data.save()
            # print(file_name,research_id,frame_num_from_ori)

            # break
        
        self._task.save()
        self._source_data.save()

    def get_task(self,task_id):
        task = Task.objects.get(id=task_id)
        source_data = task.source_data
        image_data_list = ImageData.objects.filter(source_data=source_data)
        # print(image_data_list)
        return task,source_data,image_data_list
        # return



    def _get_source_data_file_list(self,sub_dir):
        # get image list

        png_list = []

        if settings.TASK_STORE_ROOT_PATH[-1] == '/':
            find_path = settings.TASK_STORE_ROOT_PATH + sub_dir
        else:
            find_path = settings.TASK_STORE_ROOT_PATH + '/' + sub_dir

        for root, dirs, files in os.walk(find_path):
            for file in files:
                if file.endswith(".png"):
                    png_list.append(os.path.join(root, file))

        return png_list


class TaskImageAdmin:
    def __init__(self,image_data_list,image_size=(384,384)) -> None:
        self._image_data_list = image_data_list
        self._source_data = image_data_list[0].source_data
        self._image_size = image_size
        
        return
    
    def get_image(self,frame_num):


        if settings.TASK_STORE_ROOT_PATH[-1] == '/':
            image_path = settings.TASK_STORE_ROOT_PATH+self._source_data.file_dir+'/'+self._image_data_list[frame_num].file_name
        else:
            image_path = settings.TASK_STORE_ROOT_PATH+'/'+self._source_data.file_dir+'/'+self._image_data_list[frame_num].file_name

        image = Image.open(image_path)
        image = image.resize(self._image_size)
        
        # print(image.size)

        return image


