FROM python:latest
ENV PYTHON_VERSION=3.10.2
ENV DEBUG=False
WORKDIR /app
COPY requirements.txt /app
RUN pip3 install -r requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-hrv libgl1
COPY . /app
RUN python3 manage.py migrate
CMD ["gunicorn", "-b", "0.0.0.0:8000" ,"Digitalizacija.wsgi"]
