FROM python:latest
ENV DATABASE_URL=postgres://digitalizacijadb_user:ktNwPTCrjrq4FTsBPKe0HhRMWb1bHqI0@dpg-clt2r0ipmc4c73dvmnsg-a.frankfurt-postgres.render.com/digitalizacijadb
ENV DEBUG=False
ENV PYTHON_VERSION=3.10.2
ENV SEACRET_KEY=1213141516171819
WORKDIR /app
COPY requirements.txt /app
RUN pip3 install -r requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr
COPY . /app
RUN python3 manage.py migrate
RUN gunicorn Digitalizacija.wsgi
