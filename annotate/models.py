from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class SourceData(models.Model):
    id = models.AutoField(primary_key=True)
    file_num = models.PositiveBigIntegerField()
    file_dir = models.CharField(max_length=100)

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    created_time = models.DateTimeField(auto_now_add=True)
    source_data = models.OneToOneField(SourceData,on_delete=models.CASCADE)
    stop_frame = models.PositiveBigIntegerField(default=0)

    def __str__(self):
        return self.name

class ImageData(models.Model):

    id = models.AutoField(primary_key=True)
    file_name = models.CharField(max_length=100)
    research_id = models.CharField(max_length=100)
    frame_num_from_ori = models.PositiveBigIntegerField()
    source_data = models.ForeignKey(SourceData,on_delete=models.CASCADE)
    created_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

class AnnotationData(models.Model):

    VIEW_CHOICES = (
        ('2ch','2ch'),
        ('3ch','3ch'),
        ('4ch','4ch'),
        ('other','other')
    )

    id = models.AutoField(primary_key=True)
    image_data = models.OneToOneField(ImageData,on_delete=models.CASCADE)
    created_time = models.DateTimeField(auto_now_add=True)
    view = models.CharField(max_length=10)
    key_points = models.JSONField()

    def __str__(self):
        return self.image_data.file_name




class Polygons(models.Model):
    AREA_CHOICES = (
        ('LV','Left Ventricle'),
        ('LVM','Left Ventricular Myocardium'),
        ('LA','Left Atrium'),
        ('LAM','Left Atrial Myocardium'),
        ('other','other'),
    )
    area = models.CharField(max_length=10,choices=AREA_CHOICES)
    annotation_data = models.ForeignKey(AnnotationData,on_delete=models.CASCADE)
    points = models.JSONField()

    class Meta:
        ordering = ['area']
    
    def __str__(self):
        return self.area

    
