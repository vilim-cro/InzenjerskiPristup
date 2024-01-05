import requests

def uploadImage(file):
    url = "https://api.imgur.com/3/image"

    payload = {}
    files=[('image',file)]
    headers = {
    'Authorization': 'Bearer 42da1d9d5f988f0c8094f47575fc700c59c3192c',
    'Cookie': 'IMGURSESSION=30531c4846be6f15da7930444abefd46; _nc=1'
    }
    response = requests.post(url, headers=headers, data=payload, files=files)
    json = response.json()
    
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