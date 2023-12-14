FROM python:3.10-alpine
ENV DATABASE_URL=postgres://digitalizacijadb_user:ktNwPTCrjrq4FTsBPKe0HhRMWb1bHqI0@dpg-clt2r0ipmc4c73dvmnsg-a.frankfurt-postgres.render.com/digitalizacijadb
ENV DEBUG=False
ENV PYTHON_VERSION=3.10.2
ENV SEACRET_KEY=1213141516171819
WORKDIR /app
COPY ./IzvorniKod/Digitalizacija/requirements.txt /app
RUN pip3 install -r requirements.txt --no-cache-dir
COPY ./IzvorniKod/Digitalizacija/* /app
ENTRYPOINT ["entrypoint.sh"]
