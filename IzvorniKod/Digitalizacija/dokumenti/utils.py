import requests

def uploadImage(file):
    print("File u uploadImage", file)
    upload_url = "https://vgy.me/upload"
    userkey = "Ugf3LlaL3n7etHiNGQQxLHHr5L8IrDdt"

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

    #Upload-a sliku na vgy.me
    #Username: IngPristup  Pass.IngPristup69
    #Vraća dict koji ima url slike, i url za obrisati