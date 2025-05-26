from pymongo import MongoClient
import datetime

class MongoClass():

    def __init__(self, _config_object):
        connection = MongoClient(_config_object.mongourl)
        self.db=connection[_config_object.mongodb]

    def mongo_apperrlog(self,dict):
        # connecting to Mongo with cridentials obtained
        collection = self.db["errors"]
        dict_mod = dict
        dict_mod["datetimeUTC"]=datetime.datetime.utcnow()
        # getting the collection as a list
        result = collection.insert_one(dict_mod)
        return result.inserted_id

    def mongo_tikastatuslog(self,dict):
        # connecting to Mongo with cridentials obtained
        collection = self.db["tika_status"]
        dict_mod = dict
        dict_mod["datetimeUTC"]=datetime.datetime.utcnow()
        # getting the collection as a list
        result = collection.insert_one(dict_mod)
        return result.inserted_id

    def mongo_indexed_successfully(self,dict):
        # connecting to Mongo with cridentials obtained
        db = self.db
        collection = self.db["indexed_successfully"]
        dict_mod = dict
        dict_mod["datetimeUTC"]=datetime.datetime.utcnow()
        # getting the collection as a list
        result = collection.insert_one(dict_mod)
        return result.inserted_id