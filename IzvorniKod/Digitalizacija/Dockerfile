FROM python:latest
ENV DATABASE_URL=postgres://baza2_user:aO1UOBWlqVF5bP95H4NF5QpXxyMnvyhI@dpg-cma3v5mn7f5s73ddhvbg-a.oregon-postgres.render.com/baza2
ENV PYTHON_VERSION=3.10.2
ENV SEACRET_KEY=django-insecure-hbsqj-uuu)vq_ee$o&y+9-)^c9+^#%nk_4r%9b1#osaa6l9j(l
WORKDIR /app
COPY requirements.txt /app
RUN pip3 install -r requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-hrv libgl1
COPY . /app
ENV DEBUG=False
RUN python3 manage.py migrate
CMD ["gunicorn", "-b", "0.0.0.0:8000" ,"Digitalizacija.wsgi"]
