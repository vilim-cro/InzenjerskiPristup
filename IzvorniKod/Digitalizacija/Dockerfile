FROM python:latest
ENV DATABASE_URL=postgres://baza2_user:aO1UOBWlqVF5bP95H4NF5QpXxyMnvyhI@dpg-cma3v5mn7f5s73ddhvbg-a.oregon-postgres.render.com/baza2
ENV DEBUG=False
ENV PYTHON_VERSION=3.10.2
ENV SEACRET_KEY=1213141516171819
WORKDIR /app
COPY requirements.txt /app
RUN pip3 install -r requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-hrv libgl1
COPY . /app
EXPOSE 8000
RUN python3 manage.py migrate
CMD ["gunicorn", "-b", "0.0.0.0:8000" ,"Digitalizacija.wsgi"]
