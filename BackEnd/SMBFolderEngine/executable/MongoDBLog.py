# -*- coding: utf-8 -*-
from SearchHelpingFunctions import logToFileAndConsole
from pymongo import MongoClient
from datetime import datetime

def logToMongo(_mongoConnectionString,_db,_collection, _jsonRequest,_logDir):
    #This function perfornmes logging to MongoDB 
    #Parameters
    #1 - connecion string to mongo db
    #2 - name of db in mongoDB. If db does not exist - it will be created
    #3 - name of collection in db. If collection does not exist - it will be created
    #4 - json document to be inserted to the db
    #5 - name of log in which error messages will be looged
    #Example of function invocation logToMongo("mongodb://172.23.67.160:27017","kir","file_index_cycle_log",jsonRequest,"SearchUpdateLogs")
    try:
        client = MongoClient(_mongoConnectionString)
    except Exception as e:
        logToFileAndConsole(_logDir,"ApplicationErrors.log","ERROR",format(datetime.now()),"Connection to MongoDB",e)
        exit()

    db = client[_db]
    collection = db[_collection]

    try:
        result = collection.insert_one(_jsonRequest)
        status = "Success"
    except Exception as e:
        logToFileAndConsole(_logDir,"MongoDBerrors.log","ERROR",format(datetime.now()),"Insert operation to MongoDB failed",e)
        status = "Failed"
        exit()
    
    return status



