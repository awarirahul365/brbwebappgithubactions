
from typing import Any, Optional
from azure.core.credentials_async import AsyncTokenCredential
from azure.data.tables.aio import TableClient
from azure.data.tables import UpdateMode
from azure.core.exceptions import HttpResponseError

import os
import logging
import asyncio
import traceback
from time import time

from services.auth_service import AuthService


class TableService(object):
    """Class for handling Azure Table Storage operations"""

    @staticmethod
    def get_table_client_env(connection_name: str, table_name: str, credential: Optional[AsyncTokenCredential]=None):
        """Get table client from environment variables

        Args:
            connection_name (str): The name of the environment variable containing the connection string or table service URI
            table_name (str): The name of the table
            credential (Optional[AsyncTokenCredential], optional): The credential to use. Defaults to None.

        Returns:
            TableClient: The table client
        """
        if connection_name in os.environ:
            connection_string = os.getenv(connection_name)
            return TableService.get_table_client(
                table_name=table_name, connection_string=connection_string
            )
        connection_name += "__tableServiceUri"
        if connection_name in os.environ:
            endpoint = os.getenv(connection_name)
            if credential is None:
                credential = AuthService.get_default_credential() # WARNING: this will trigger an unclosed session warning
            return TableService.get_table_client(table_name=table_name, credential=credential, endpoint=endpoint)
        else:
            raise Exception("Table connection could not be found in environment")
            

    @staticmethod
    def get_table_client(
        table_name: str,
        credential: Optional[AsyncTokenCredential]=None,
        endpoint: Optional[str]=None,
        connection_string: Optional[str]=None
    ) -> TableClient:
        if connection_string is not None:
            table_client = TableClient.from_connection_string(
                table_name=table_name,
                conn_str=connection_string
            )
        else:
            table_client = TableClient(
                endpoint=endpoint, 
                table_name=table_name, 
                credential=credential
            )
        
        return table_client

    @staticmethod
    async def check_table(table_client: TableClient):
        
        async with table_client:
            try:
                await table_client.create_table()
                return 1
            except HttpResponseError:
                logging.info("Table already exist.")
                return 1
            except Exception as ex:
                logging.error(f"Error connecting to table: {ex}")

        return 0

    @staticmethod
    async def update_entity(table: TableClient, entity: Any):
        try:
            await table.upsert_entity(entity, mode="merge")
            return 1
        except Exception as ex:
            logging.error(f"Unexpected error while updating entity: {ex}")

        return 0
    
    @staticmethod
    async def create_entity(table: TableClient, entity: Any):
        try:
            await table.create_entity(entity=entity)
            return 1
        except Exception as ex:
            logging.error(f"Unexpected error while updating entity: {ex}")

        return 0
    
    @staticmethod
    async def delete_entity(table: TableClient, partition_key: str, row_key: str):
        try:
            await table.delete_entity(partition_key, row_key)
            return 1
        except Exception as ex:
            logging.error(f"Unexpected error while deleting entity: {ex}")

        return 0
    
    @staticmethod
    async def delete_batch(table: TableClient, entities: list):
        operations = [("delete", entity) for entity in entities]
        try:
            await table.submit_transaction(operations)
            logging.debug(f"Batch of {len(entities)} entities deleted successfully.")
            return 1
        except Exception as ex:
            logging.error(f"Unexpected error while deleting entities: {ex}")
        
        return 0

    @staticmethod
    async def run_entities(table_client: TableClient, entities: list):
        result = 0
        t0 = time()
        async with table_client:
            # first try to send all at once
            result = await TableService.run_batch(table_client, entities)
            # if it didn't work, send individually
            if not result > 0:
                result = await TableService.run_entity_list(table_client, entities)

        logging.info("Sending entities to table took {:.3f}s".format(time()-t0))
        return result


    @staticmethod
    async def run_batch(table_client: TableClient, entities: list):

        operations = [("upsert", entity, {"mode": UpdateMode.MERGE}) for entity in entities]
        try:
            await table_client.submit_transaction(operations)
            logging.debug(f"Batch of {len(entities)} entities sent successfully.")
            return 1
        except Exception as ex:
            logging.error(f"Unexpected error while sending entities: {ex}")
            logging.debug(traceback.format_exc())
        
        return 0

    @staticmethod
    async def run_entity_list(table_client: TableClient, entities: list):

        tasks = [
            asyncio.create_task(
                TableService.update_entity(
                    table_client,
                    entity
                )
            ) for entity in entities
        ]
        result = await asyncio.gather(*tasks)
        
        n_sent = sum(result)
        logging.info(f"Successfully sent {n_sent} out of {len(entities)} entities.")

        return n_sent
    
    @staticmethod
    async def iterate_entities_list(entities_list):
        listans=[]
        async for i in entities_list:
            listans.append(i)
        return listans

    @staticmethod
    async def entity_list(table_client:TableClient):
        filter="PartitionKey eq 'AzureCaseNumber'"
        entities_list=table_client.list_entities()
        final_list=await TableService.iterate_entities_list(entities_list)
        return final_list