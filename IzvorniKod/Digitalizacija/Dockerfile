FROM python:${PYTHON_VERSION}
ENV DATABASE_URL=postgres://digitalizacijadb_user:ktNwPTCrjrq4FTsBPKe0HhRMWb1bHqI0@dpg-clt2r0ipmc4c73dvmnsg-a.frankfurt-postgres.render.com/digitalizacijadb
ENV DEBUG=False
ENV SEACRET_KEY=1213141516171819
WORKDIR /app
COPY requirements.txt /app
RUN pip3 install -r requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-hrv
COPY . /app
EXPOSE ${PORT}
RUN python3 manage.py migrate
RUN gunicorn Digitalizacija.wsgi
