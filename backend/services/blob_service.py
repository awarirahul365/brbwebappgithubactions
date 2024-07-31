import logging

from azure.storage.blob import BlobServiceClient
from azure.storage.blob import ContainerClient

from typing import Any

class BlobStore(object):

    def __init__(self, connection_string: str, container_name: str,blob_name:str) -> None:
        
        self._get_clients(connection_string, container_name,blob_name)


    def _get_clients(self, conn_string: str, container_name: str,blob_name:str):

        bs_client: BlobServiceClient = BlobServiceClient.from_connection_string(conn_string)
        cont_client = bs_client.get_container_client(container=container_name)
        blob_client=bs_client.get_blob_client(container=container_name,blob=blob_name)

        self._check_container(cont_client)

        self._blob_service_client = bs_client
        self._container_client = container_name
        self._blob_client=blob_client


    def _check_container(self, container_client: ContainerClient):
        
        try:
            container_props = container_client.get_container_properties()
            logging.info("Container already exists.")
            logging.info("Properties: {0}".format(container_props))
        except:
            container_client.create_container()
        
        self.container_props = container_client.get_container_properties()

    def dump_data(self, file_name: str, data: Any):

        bs_client = self._blob_service_client
        container = self.container_props

        blob_client = bs_client.get_blob_client(container=container, blob=file_name)
        blob_client.upload_blob(data, overwrite=True)