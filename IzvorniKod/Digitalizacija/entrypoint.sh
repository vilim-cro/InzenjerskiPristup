apt-get update && apt-get install -y tesseract-ocr
python3 manage.py migrate
gunicorn Digitalizacija.wsgi
