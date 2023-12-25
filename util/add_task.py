"""
Usage: python add_task.py
    change the 
    tasks = ['chi-chun-a3c-2']
    sub_dir = ['chi-chun-a3c-2']
    view = ['a3c']   # 2ch, 3ch or 4ch
    python3 manage.py shell < add_task.py
   

"""
from annotate.task_admin import TaskAdmin
from annotate.models import Task

def add_task(sub_dir, task_name,view):
    """
    Add a task to a sub_dir
    """
    print("Adding task: " + task_name)
    task_admin = TaskAdmin()
    task_admin.add_task_and_annotation(task_name, sub_dir,view)

def create_annotation(task_name):
    tmp_tasks = Task.objects.filter(name=task_name)



tasks = ['chi-chun-a2c-2','chi-chun-a3c-2','chi-chun-a4c']
sub_dir = ['chi-chun-a2c-2','chi-chun-a3c-2','chi-chun-a4c']
view = ['2ch','3ch','4ch']

for i in range(len(tasks)):
    add_task(sub_dir[i],tasks[i],view[i])
    
