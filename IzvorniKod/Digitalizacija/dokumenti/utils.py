import requests

def uploadImageOld(file):
    print("File u uploadImage", file)
    upload_url = "https://vgy.me/upload"
    userkey = "pwOQMGygpvrYE2z6m2QeGexlpL9WyvFE"

    files = {'file': file}
    data = {'userkey': userkey}
    print(files, data)
    response = requests.post(upload_url, files=files, data=data)

    print("ODGOVOR", response)
    json = response.json()
    
    if response.status_code == 200:
        return {'url': json['image'], 'delete_url': json['delete']}
    else:
        return json

import requests

def uploadImage(file):
    print("File u uploadImage", file)
    url = "https://api.imgur.com/3/image"

    payload = {}
    files=[('image',file)]
    headers = {
    'Authorization': 'Bearer 42da1d9d5f988f0c8094f47575fc700c59c3192c',
    'Cookie': 'IMGURSESSION=30531c4846be6f15da7930444abefd46; _nc=1'
    }
    response = requests.post(url, headers=headers, data=payload, files=files)

    print("ODGOVOR", response)
    json = response.json()
    print("Json", json)
    
    if response.status_code == 200:
        return {'url': json['data']['link']}
    else:
        return response


    #Upload-a sliku na vgy.me
    #Username: IngPristup  Pass.IngPristup69
    #Vraća dict koji ima url slike, i url za obrisati
    #imgur clientid 7af1ed47cf4dd71
    #imgur client secret 1b2d78530eaf82ff9e422a0a47a3259213c28211
    #access tokken 42da1d9d5f988f0c8094f47575fc700c59c3192c