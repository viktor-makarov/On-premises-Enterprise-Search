# -*- coding: utf-8 -*-

from tkinter import E
from elasticsearch import Elasticsearch
import os
from os.path import isfile, abspath,isfile, join
import codecs
from datetime import datetime
import atexit
import json
import time
from SearchHelpingFunctions import logToFileAndConsole
from mongo import MongoClass
from pathlib import Path
import platform


class DeleteFunc:
    def __init__(self,path):

        self.path = path
        self.os_type = platform. system()
        print("Config path",path)
        print("OS type",self.os_type)
        pass

    def Process(self):
        #Открываем файл с параметрами. Файл с параметрами читается один раз, так что если нужно перезагрузить его - нужно перезапустить приложение
        try:
            #param_file_path = "C:\\search\\etl\\airflow\\config\\FileDeletingParam.json"
            param_file_path = self.path
            
            param_file = codecs.open(param_file_path,'r','utf-8-sig')
            param_text = param_file.read()
            param_file.close() #Закрываем файл с параметрами
            param_json = json.loads(param_text)
            P_Indexes = param_json["Indexes"]
            infoMessage = "Info | " + format(datetime.now()) + " | Open param. file: " + param_file_path + " | Successfuly"
            print(infoMessage)
        except Exception as e:
            print(format(datetime.now()),"Open param. file: " + param_file_path,e) 
            exit()

        #Создаем подключение к ES
        try:
            #es = Elasticsearch(hosts=[{'host': 'sr-rti-sql-11.aorti.ru', 'port': 9200}],
            #                    scheme="https",
            #                    use_ssl=True,
            #                    verify_certs=True,
            #                    ca_certs="D:\Elasticsearch\config\certs\ca\ca.crt",
            #                    api_key=('zaxQdnUBjaV01I3E5fpH', 'lFwJ-OSNS0CNtHkTbF_oeQ'))
            es = Elasticsearch(hosts=["https://192.168.50.13:9200"], 
                        http_auth=('elastic', 'elastic'), verify_certs=False)
        
            infoMessage = "Info | " + format(datetime.now()) + " | Connected to Elasticsearch | Successfuly"
            print(infoMessage)
        except Exception as e:
            print(format(datetime.now()),"Connection to Elasticsearch", "Failed",e) 
            exit()

        cyclecount=1
        start_cycle = datetime.now()
        filesDeleted=0
        for index in P_Indexes:

            # Запрашиваем из индекса

            start_time = datetime.now()
            try:
                itemsUploadedSoFar = 0
                batchSize = 10000
                print("(1) Start getting data from index",index,"in batches by ",batchSize)
                searchResult = es.search(index=index, _source_includes=["action_link"], size = batchSize, scroll = "1m")
                totalItems = searchResult["hits"]["total"]["value"]
                scroll_id = searchResult["_scroll_id"]
                resultHits = searchResult["hits"]["hits"]
                itemsUploadedSoFar = itemsUploadedSoFar+batchSize
                print(len(resultHits))
                while itemsUploadedSoFar<totalItems:
                    scrollResult = es.scroll(scroll_id=scroll_id,scroll = "1m")
                    resultHits = resultHits + scrollResult["hits"]["hits"]
                    print(len(resultHits))
                    itemsUploadedSoFar = itemsUploadedSoFar+batchSize

            except Exception as e:
                print(format(datetime.now()),"Search operation failed",e) 
                continue

            duration = format(datetime.now() - start_time)
            print("QueryTime",duration)

            start_time = datetime.now()
            print("(2) Further check file existence and if absent delete from index")
            scancount=0
            for resultHit in resultHits:
                linkToFile = resultHit["_source"]["action_link"]
                if self.os_type == "Windows":
                    linkToFile = linkToFile.replace('/','\\')
                else:
                    linkToFile = linkToFile.replace('\\\\','\\').replace('\\','/')

                id = resultHit["_id"]
                if not os.path.exists(linkToFile):
                    try:
                        deleteResult = es.delete(index=index, id=id, ignore=[400, 404])
                        print("Удаление",format(datetime.now()),"Путь: " + str(linkToFile),"Id: " + id,"ES response: " + str(deleteResult))
                        filesDeleted=filesDeleted+1
                    except Exception as e:
                        print(format(datetime.now()),"Delete operation failed","Id: " + id,e) 
                        continue
                scancount=scancount+1
                if scancount % batchSize == 0:
                    print("Scanned",scancount)

            
            resultHits = [] #Высвобождаем переменную
            duration = format(datetime.now() - start_time)
            print("FolderScanTime",duration,"ScanCount",scancount)

        cycleduration = format(datetime.now() - start_cycle)
        print("Cycle count: " + str(cyclecount),"Cycle duration: " + cycleduration,"FilesDeleted : " + str(filesDeleted)) 
        cyclecount = cyclecount+1
        return cycleduration, cyclecount, filesDeleted  


    
 






