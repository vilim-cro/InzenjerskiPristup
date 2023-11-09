import requests

def uploadImage(file):
    upload_url = "https://vgy.me/upload"
    userkey = "pwOQMGygpvrYE2z6m2QeGexlpL9WyvFE"

    files = {'file': file}
    data = {'userkey': userkey}
    response = requests.post(upload_url, files=files, data=data)

    json = response.json()
    if response.status_code == 200:
        return {'url': json['image'], 'delete_url': json['delete']}
    else:
        return json

    #Upload-a sliku na vgy.me
    #Username: IngPristup  Pass.IngPristup69
    #Vraća dict koji ima url slike, i url za obrisati