from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from services.auth_service import AuthService
import asyncio
from azure.mgmt.support.aio import MicrosoftSupport
from azure.identity import ClientSecretCredential
from datetime import datetime
from flask_caching import Cache
from services.blob_service import BlobStore
import json
from flasgger import Swagger
from services.support_service import SupportService
load_dotenv()
#app = Flask(__name__)
app=Flask(__name__, static_folder='build', static_url_path='/')
swagger = Swagger(app)
CORS(app)  # This will enable CORS for all routes

@app.route('/')
def index():
  return send_from_directory(app.static_folder, 'index.html')

@app.route('/submit', methods=['GET','POST'])
async def submit_form():
    global form_data
    data = request.json
    form_data=request.json
    print(data)  # Do something with the data
    print(os.getenv('FLASK_ENV'))
    credential_list=AuthService.get_credential_keys()
    result=await SupportService.createticket(credential_list,data)
    return jsonify({"data": result})

@app.route('/preview',methods=['GET','POST'])
async def preview_form():
    global form_data
    form_data=request.json
    print(form_data)
    print(form_data['additionalcomments'])
    subid=form_data['subscriptionid']
    aznum=form_data['azurecasenumber']
    additionalemail=form_data['emailaddress']
    credential_list=AuthService.get_credential_keys()
    print(credential_list)
    preview_async=await asyncio.gather(
        *(asyncio.create_task(
            SupportService.previewsupportticket(cred,subid=subid,azurecasenumber=aznum,meetinglink=form_data['meetinglink'],additionalcomments=form_data['additionalcomments'],additionalemail=additionalemail)
        ) for cred in credential_list)
    )
    previewdetails=preview_async[0]
    print(preview_async)
    return jsonify(previewdetails)

@app.route('/gethistory',methods=['GET','POST'])
async def get_history():
    credential,cloud=AuthService.get_credential('CredSAPTenant')
    historylist=[]
    clientcred=MicrosoftSupport(
        credential=credential,
        subscription_id="b437f37b-b750-489e-bc55-43044286f6e1",
        base_url="https://management.azure.com"
    )
    response=clientcred.support_tickets.list()
    async for i in response:
        historylist.append({
                'title':i.title,
                'AzureCaseNumber':i.support_ticket_id,
                'Ticketname':i.name,
                'Severity':i.severity,
                'Created-date':str(i.created_date),
                'Status':i.status
            })
    jsonoutput=json.dumps(historylist)
    return jsonoutput

@app.route('/updatetemplate',methods=['POST'])
def update_template():

    textdata=request.json.get('text')
    blobservice=BlobStore(
        connection_string="DefaultEndpointsProtocol=https;AccountName=brbstorage;AccountKey=rEz4sncnMy4zz4fiJ5shCq+NSm1ooLt5FGtwBKP/9mZmQVJh1xMbo5lj7X0sPycMNKHQypgSGy+f+AStSlejbA==;EndpointSuffix=core.windows.net",
        container_name="updatetemplate",
        blob_name="brbtickettemplate"
    )
    blobservice.dump_data(
        file_name='brbtickettemplate.txt',
        data=textdata
    )
    return jsonify(textdata)

@app.route('/oldtemplatepreview',methods=['GET','POST'])
def preview_old_template():
    bs=BlobStore(
        connection_string="DefaultEndpointsProtocol=https;AccountName=brbstorage;AccountKey=rEz4sncnMy4zz4fiJ5shCq+NSm1ooLt5FGtwBKP/9mZmQVJh1xMbo5lj7X0sPycMNKHQypgSGy+f+AStSlejbA==;EndpointSuffix=core.windows.net",
        container_name="updatetemplate",
        blob_name="brbtickettemplate.txt"
    )
    bcl=bs._blob_client.download_blob().readall()
    txt_data=bcl.decode('utf-8')
    print(txt_data)
    return jsonify(txt_data)
if __name__ == '__main__':
    app.run(debug=True)
