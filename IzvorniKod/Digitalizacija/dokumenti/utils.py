import requests

def uploadImage(image_path):
    upload_url = "https://vgy.me/upload"
    userkey = "pwOQMGygpvrYE2z6m2QeGexlpL9WyvFE"

    with open(image_path, 'rb') as file:
        files = {'file': (image_path, file)}
        data = {'userkey': userkey}
        response = requests.post(upload_url, files=files, data=data)

    json = response.json()
    if response.status_code == 200:
        return {'url': json['url'], 'delete_url': json['delete']}
    else:
        return json['messages']
    
    #Upload-a sliku na vgy.me
    #Username: IngPristup  Pass.IngPristup69
    #Vraća dict koji ima url slike, i url za obrisati
