import os
from services.auth_service import AuthService
import asyncio
from azure.mgmt.support.aio import MicrosoftSupport
from datetime import datetime
import logging
class SupportService:

    def __init__(self) -> None:
        pass

    async def previewsupportticket(
            credential_key:str,
            subid:str,
            azurecasenumber:str,
            meetinglink:str,
            additionalcomments:str,
            additionalemail:str
        ):
        credential,cloud=AuthService.get_credential(credential_key)
        payload={}
        print(additionalcomments)

        try:
            async with credential:
                try:
                    client=MicrosoftSupport(
                        credential=credential,
                        subscription_id= subid, 
                        base_url = 'https://management.azure.com'
                    )
                    response=client.support_tickets.list(
                        top=20,
                        filter="status eq 'Open'")
                    async for i in response:
                        if i.support_ticket_id==azurecasenumber:
                            contactdetails=i.contact_details
                            description=i.description
                            problemClassificationId=i.problem_classification_id
                            serviceId=i.service_id
                            severity=i.severity
                            title=i.title
                            diag=i.advanced_diagnostic_consent
                            description += f"<br/><br/><strong>Meeting link:</strong>"+" "+meetinglink+f"<br/><br/><strong>Additional Details:</strong>"+" "+additionalcomments
                            payload={
                                "contactDetails":{
                                "country": contactdetails.country,
                                "firstName": contactdetails.first_name,
                                "lastName": contactdetails.last_name,
                                "preferredContactMethod": contactdetails.preferred_contact_method,
                                "preferredSupportLanguage": contactdetails.preferred_support_language,
                                "preferredTimeZone": contactdetails.preferred_time_zone,
                                "primaryEmailAddress": contactdetails.primary_email_address,
                                "additionalEmailAddresses": [additionalemail]
                            },
                            "description":description,
                            "problemClassificationId":problemClassificationId,
                            "serviceId":serviceId,
                            "severity":severity,
                            "title":title,
                            "advanced_diagnostic_consent":diag
                            }
                            break
                except Exception as e:
                    logging.error(f"Failed to find support ticket as client error {e}")
                    return None

            return payload
        except Exception as e:
            logging.error({e})
            return None
    
    async def _searchsupportticket(
            credential_key:str,
            subid:str,
            azurecasenumber:str,
            meetinglink:str,
            additionalcomments:str,
            additionalemail:str
    ):
        credential,cloud=AuthService.get_credential(credential_key)
        payload={}
        try:
            async with credential:
                client=MicrosoftSupport(
                    credential=credential,
                    subscription_id= subid, 
                    base_url = 'https://management.azure.com'
                )
                response=client.support_tickets.list(
                    top=20,
                    filter="status eq 'Open'")
                async for i in response:
                    if i.support_ticket_id==azurecasenumber:
                        contactdetails=i.contact_details
                        description=i.description
                        problemClassificationId=i.problem_classification_id
                        serviceId=i.service_id
                        severity=i.severity
                        title=i.title
                        diag=i.advanced_diagnostic_consent
                        desp_content=[description,"Meeting Link:",meetinglink,"Additional Comments",additionalcomments,"Reference Ticket",azurecasenumber]
                        description="\n".join(desp_content)
                        #description += f"<br/><br/><strong>Meeting link:</strong>"+" "+meetinglink+f"<br/><br/><strong>Additional Details:</strong>"+" "+additionalcomments
                        payload={
                            "contactDetails":{
                            "country": contactdetails.country,
                            "firstName": contactdetails.first_name,
                            "lastName": contactdetails.last_name,
                            "preferredContactMethod": contactdetails.preferred_contact_method,
                            "preferredSupportLanguage": contactdetails.preferred_support_language,
                            "preferredTimeZone": contactdetails.preferred_time_zone,
                            "primaryEmailAddress": contactdetails.primary_email_address,
                            "additionalEmailAddresses": [additionalemail]
                        },
                        "description":description,
                        "problemClassificationId":problemClassificationId,
                        "serviceId":serviceId,
                        "severity":severity,
                        "title":title,
                        "advanced_diagnostic_consent":diag
                        }
                        break
            return payload
        except Exception as e:
            logging.error({e})
    
    async def createticket(
            credential_list:str,
            data
        ):
        oldticketdetails = await asyncio.gather(
            *(asyncio.create_task(
                SupportService._searchsupportticket(cred,data['subscriptionid'],data['azurecasenumber'],data['meetinglink'],data['additionalcomments'],data['emailaddress'])
            ) for cred in credential_list)
        )
        ticketdetails=oldticketdetails[0]
        print("Fetched ticket details")
        print(ticketdetails)
        if len(ticketdetails)==0:
            outcome="Failed to create ticket"
        else:
            credential_key_brb_sub=os.getenv('CredentialKeysBRB')
            credential_brb,cloud=AuthService.get_credential(credential_key=credential_key_brb_sub)
            async with credential_brb:
                clientdest=MicrosoftSupport(
                    credential=credential_brb,
                    subscription_id= data['subscriptionid'], 
                    base_url = 'https://management.azure.com'
                )
                current_datetime=datetime.now()
                date_string = current_datetime.strftime('%Y%m%d%H%M%S')
                ticketname="testbrbticket"+"_"+date_string
                print(ticketname)
                await clientdest.support_tickets.begin_create(
                    support_ticket_name=ticketname,
                    create_support_ticket_parameters=ticketdetails
                )
            #print(datetime_string)
            outcome="Ticket created"
        return outcome