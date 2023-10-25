from django.contrib import admin

# Register your models here.
from annotate.models import SourceData, Task

admin.site.register(SourceData)
admin.site.register(Task)

