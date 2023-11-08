FROM python:3.10

# Path: /app
WORKDIR /web

# Path: /web/requirements.txt
COPY requirements.txt .

# Path: /web
RUN pip install -r requirements.txt
RUN pip3 install uwsgi
RUN pip uninstall opencv-python -y
RUN pip install opencv-python-headless



# Path: /web
# COPY . .

copy ./docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/bin/bash","/docker-entrypoint.sh"]

EXPOSE 8000

# Path: /web
#CMD python manage.py runserver
# CMD uwsgi --ini uwsgi.ini

