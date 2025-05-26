# -*- coding: utf-8 -*-

#TODO

#4. Count actual number of threads instead of counting numbers

from pathlib import Path
import psutil

import ssl

import base64
from datetime import datetime
import codecs
import time
import os
from multiprocessing import Process, current_process
import platform

try:
    import win32net
except:
    pass
import atexit
import os
import sys
import re
import json
from os.path import abspath,isfile, join
import inspect
from lxml import etree as et
import xml.etree.ElementTree as ET
import threading
#from elasticsearch.connection import create_ssl_context
from SearchFileIndexModule import fileIndex

from SearchHelpingFunctions import logToFileAndConsole
from SearchHelpingFunctions import ES_write
from MongoDBLog import logToMongo
from StatisticsClass import Statistics
from ParamTableClass import ParamTableClass
from FileContainerClass import FileContainer
from mongo import MongoClass

def NonImageFilesFromat(filePath):
    formatsList = ParTable.formatsList
    for format in formatsList:
        if filePath.name.lower().endswith(format.lower()):
            return 1
    return 0

def whenExit():
    logToFileAndConsole(os.path.dirname(abspath(inspect.getsourcefile(lambda:0))),"ApplicationErrors.log","STOP",current_process().name,"App is stopped")

class IndexOneThread():

    def __init__(self, file,ParTable,es,mongo,stat):

        """Инициализация потока"""
        self.error = False
        self.file = file
        self.source = ParTable.source
        self.streamType = ParTable.file_category
        self.index_name = stat.indexCurrentName(ParTable.file_category)
        self.folderName=stat.indexCurrentFolderName(ParTable.file_category)
        self.regyme=ParTable.regyme
        self.LogDir=ParTable.LogDir
        self.ParTable=ParTable
        self.es=es
        self.stat=stat
        self.mongo=mongo
        try:
            self.fileBox = FileContainer(self.file,mongo)
        except Exception as e:
            mongo.mongo_apperrlog({"func_name":"IndexOneThread.__init__","error":str(e),"err_type":"File does not exist","file_name":str(file)})
            raise ValueError('See previous error in FileContainer.__init__')
        self.stat.number_of_threads=self.stat.number_of_threads+1 #поправить

    def go(self):

        self.stat.fileProcessingStarted(self.ParTable.file_category)
        no_of_threads=self.stat.fileProcessingCurrent(self.ParTable.file_category)
        print("Checkpoint 1")
        process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,num=fileIndex(self,self.stat)
        print("Checkpoint 3")
        print_str=str(self.stat.count_processed_throught) +" "+str(no_of_threads)+" "+process_result+" "+file_format+" "+str(duration)+" "+file_size_str+" "+file_name+" ID: "+ doc_id +" created: "+file_created_by+"_"+str(file_created_date)+" modyfied: "+file_last_modified_by+"_"+str(file_last_modified_date)+" Pages: "+str(file_pages)+" textlen:"+str(file_content_ru_lenth)+" Attach: "+str(file_attachments_num)+" "+str(file_attachments_list)+"  "+str(num)
        print_json ={
            "pocessed_count":self.stat.count_processed_throught,
            "no_of_threds":no_of_threads,
            "process_result":process_result,
            "file_format":file_format,
            "duration":str(duration),
            "file_size_str":file_size_str,
            "file_name_ID":doc_id,
            "created_by":file_created_by,
            "file_created_date":file_created_date,
            "modyfied_by":file_last_modified_by,
            "modified_date":file_last_modified_date,
            "file_pages":file_pages,
            "text_len":file_content_ru_lenth,
            "attach_num":file_attachments_num
            }
        

        if not process_result in ["ALREADY IN INDEX"]:
            logToFileAndConsole(self.LogDir,"UploadedFiles.log",print_str)
            self.mongo.mongo_indexed_successfully(print_json)
            self.stat.fileUploaded(self.ParTable.file_category)
                
        self.stat.fileProcessingFinished(self.ParTable.file_category)


class IndexMultyThread(threading.Thread):
        
    def __init__(self, file,ParTable,es,mongo,stat):
        """Инициализация потока"""
        threading.Thread.__init__(self)
        try:
            self.file = file
            self.source = ParTable.source
            self.streamType = ParTable.file_category
            self.index_name = stat.indexCurrentName(ParTable.file_category)
            self.folderName=stat.indexCurrentFolderName(ParTable.file_category)
            self.regyme=ParTable.regyme
            self.LogDir=ParTable.LogDir
        
            self.ParTable=ParTable
            self.es=es
            self.stat=stat
            self.mongo=mongo
            try:
                self.fileBox = FileContainer(self.file,mongo)
            except Exception as e:
                mongo.mongo_apperrlog({"func_name":"IndexOneThread.__init__","error":str(e),"err_type":"File does not exist","file_name":str(file)})
                raise ValueError('See previous error in FileContainer.__init__')
            self.stat.number_of_threads=self.stat.number_of_threads+1 #поправить
        except Exception as e:
            mongo.mongo_apperrlog({"func_name":"IndexMultyThread.__init__","error":str(e),"err_type":"File container","file_name":str(file)})
            raise ValueError('See previous error in FileContainer.__init__')

    def run(self):
        
        try:
            """Запуск потока"""
            
            self.stat.fileProcessingStarted(self.ParTable.file_category)
            no_of_threads=self.stat.fileProcessingCurrent(self.ParTable.file_category)
            process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,num=fileIndex(self,self.stat)
            print_str=str(self.stat.count_processed_throught) +" "+str(no_of_threads)+" "+process_result+" "+file_format+" "+str(duration)+" "+file_size_str+" "+file_name+" ID: "+ doc_id +" created: "+file_created_by+"_"+str(file_created_date)+" modyfied: "+file_last_modified_by+"_"+str(file_last_modified_date)+" Pages: "+str(file_pages)+" textlen:"+str(file_content_ru_lenth)+" Attach: "+str(file_attachments_num)+" "+str(file_attachments_list)+"  "+str(num)          
            print_json ={
            "pocessed_count":self.stat.count_processed_throught,
            "no_of_threds":no_of_threads,
            "process_result":process_result,
            "file_format":file_format,
            "duration":str(duration),
            "file_size_str":file_size_str,
            "file_name_ID":doc_id,
            "created_by":file_created_by,
            "file_created_date":file_created_date,
            "modyfied_by":file_last_modified_by,
            "modified_date":file_last_modified_date,
            "file_pages":file_pages,
            "text_len":file_content_ru_lenth,
            "attach_num":file_attachments_num
            }
            if not process_result in ["ALREADY IN INDEX"]:
                logToFileAndConsole(self.LogDir,"UploadedFiles.log",print_str)
                self.mongo.mongo_indexed_successfully(print_json)
                self.stat.fileUploaded(self.ParTable.file_category)
                
            self.stat.fileProcessingFinished(self.ParTable.file_category)
   
        except Exception as e:
            print(e)
            self.stat.fileProcessingFinished(self.ParTable.file_category)
            self.mongo.mongo_apperrlog({"func_name":"IndexMultyThread.run","error":str(e),"err_type":"Syntax error","file_name":str(file)})
            exit()


class MainFunc:
    def __init__(self,path):
        self.path = path
        self.os_type = platform. system()
        print("Config file",path)
        print("OS type",self.os_type)

    def Process(self):
        #Включаяем функцию, которая вызовет whenExit при завершении программы
        atexit.register(whenExit)

        #Initialize statisticall class. It is later passed to each process throurh global variable
        stat =Statistics()

        fileScannedCount = 0
        filesIndexedCount = 0
        #Get path to param file from list of parameters. Or take fixed path in debug mode.
        if len(self.path)>1:
            ParamTablaPath = self.path
        else:
            print("ERROR",format(datetime.now()),"Укажите путь к файлу с параметрами")
            exit()

        procs = []

        #Initialise class that handles table with parameters
        ParTable = ParamTableClass(ParamTablaPath)

            
        
        #Создаем подключение к монго
        mongo = MongoClass(ParTable)

        #Создаем подключение к ES
        Es_class = ES_write()
        es = Es_class.connection

        P_MaxThreads = ParTable.max_threads_list[1]

        for indexPair in ParTable.index_pairs: #Берем новую пару 
            print("indexPair",indexPair)

            #Проверяем, что такой индекс есть в эластик. Если нет - создаем.
            result = Es_class.check_create_index(list(indexPair)[0])
            print(result)

            stat.indexStart(ParTable.file_category,indexPair)

            P_IndexName=list(indexPair)[0]
            P_DirPathlist =  indexPair[P_IndexName]["path"]
        
            #P_DirPathlist =  [r'\\aorti.ru\share\РТИ USGAAP']
            #P_DirPathlist =  [r'\\aorti.ru\share\РТИ USGAAP\Working papers\SearchTest']
            #P_DirPathlist =  [r'D:\RTISearch\Samples']
                
            for dirPath in P_DirPathlist: #перебираем каталог за каталогом в рамках одного индекса

                if self.os_type == "Windows":
                    dirPath = dirPath.replace('/','\\')
                else:
                    dirPath = dirPath.replace('\\\\','\\').replace('\\','/')

                basepath = Path(dirPath)
                #basepath = Path("\\\\Dfsman-1\\fs\\Стратегия")

                try:
                    if not basepath.exists():
                        mongo.mongo_apperrlog({"func_name":"controlflow","error":"Path is unreachable:" + str(basepath),"err_type":"Folder unreachable"})
                        continue
                except:
                    mongo.mongo_apperrlog({"func_name":"controlflow","error":"Path is unreachable:" + str(basepath),"err_type":"Folder unreachable"})
                    continue

                #sd = win32security.GetFileSecurity(DirPath, win32security.GROUP_SECURITY_INFORMATION)
                #a = win32security.LookupAccountSid(win32net.NetGetAnyDCName(), sd.GetSecurityDescriptorGroup())
                     
                placeholderlist = ParTable.file_types
                #placeholderlist = ["БДДС 2020-2023.xlsx"]

                try:
                    for placeholder in placeholderlist: 
                        print("filte_type_started",placeholder)

                        start_time = datetime.now()
                        n=0

                        for file in basepath.rglob(placeholder):
                        
                            n=1+n

                            fileScannedCount=fileScannedCount+1

                            #file = Path("\\\\Dfsman-1\\fs\\Финансы\\02 Перспектива\\12 Отчетность ЕИО\\Отчетность ЕИО\\ЛМЗ\\I квартел\\02_Подтверждающие документы\\Пункт 1.2\\2020-01_08-050_Проткол производственного совещания по вопросу согласования договора на поставку СГШ в рамках ГОЗ №2 от 24.01.2020г..pdf")
                            if "~$" in str(file): # ignore temp files
                                continue
                            if not file.is_file(): #итерируем только по файлам, папки игнорируем
                                continue
                        
                            while True: 
                    

                                files_in_process=stat.fileProcessingCurrent(ParTable.file_category)

                                if files_in_process<=P_MaxThreads:
                                    break
                      
                                time.sleep(1)
               
                                print("\n" + " | Current files: " + str(files_in_process))
                
                                #Обновляем MaxThread "на лету"
                        
                                memory_available_perc = round(1-psutil.virtual_memory().available/psutil.virtual_memory().total,4)
                            
                                print(memory_available_perc)

                                if memory_available_perc<ParTable.max_load_list[0]:
                              
                                    P_MaxThreads = ParTable.max_threads_list[0]

                                elif  memory_available_perc<ParTable.max_load_list[1]:
                                   
                                    P_MaxThreads = ParTable.max_threads_list[1]
                                       
                                else:
                          
                                    P_MaxThreads = ParTable.max_threads_list[2]
                                                  
                            #Вызываем функцию индексации
                            #activeThreadsList =threading.enumerate() #Get list of active threads excluding Main (first in th list)

                            #del activeThreadsList[0]

                            #if stat.threadsCurrentNumber(current_process().name)!=files_in_process:
                            #    logToFileAndConsole(ParTable.LogDir,"CurrentThreads.log",files_in_process,stat.threadsCurrentNumber(current_process().name),len(activeThreadsList),activeThreadsList) #For testing 
                    
                        
                            if ParTable.multithred:
                                try:
                                    x=IndexMultyThread(file,ParTable,es,mongo,stat)
                                except Exception as e:
                                    mongo.mongo_apperrlog({"func_name":"Main","func_place":"IndexMultyThread","error":str(e),"err_type":"Index thred init fail","file_name":str(file)})
                                    continue
                                x.setDaemon(True)
                                x.start()
                            else:
                         
                                try:
                                    x=IndexOneThread(file,ParTable,es,mongo,stat)
                                except Exception as e:
                                    mongo.mongo_apperrlog({"func_name":"Main","func_place":"IndexOneThread","error":str(e),"err_type":"Index thred init fail","file_name":str(file)})
                                    continue
                                x.go()

                            msg="\nAdded +1 | " + " | Current files: " + str(files_in_process)
                            print(msg)

                        logToFileAndConsole(ParTable.LogDir,ParTable.inggestProgressLog,placeholder,dirPath,format(datetime.now() - start_time))
                except FileNotFoundError:
                    print("Folder does not exist.")

        return fileScannedCount, filesIndexedCount

                    #logToFileAndConsole(ParTable.LogDir,"CyclesPart"+regyme+".log",placeholder,dirPath,current_process().name,stat.cycleCurrentNumber(current_process().name),stat.cycleCurrentId(current_process().name),format(datetime.now() - start_time),stat.fileProcessedSoFar(current_process().name),stat.fileUploadedSoFar(current_process().name))
                    #logDoc = {
                    #    "file_format": placeholder,
                    #    "datetime": format(datetime.now()),
                    #    "folder_path":dirPath,
                    #    "process_name":current_process().name,
                    #    "cycle_count":stat.cycleCurrentNumber(current_process().name),
                    #    "cycle_id":stat.cycleCurrentId(current_process().name),
                    #    "cycle_duration":format(datetime.now() - start_time),
                    #    "files_scanned":stat.fileProcessedSoFar(current_process().name),
                    #    "files_uploaded":stat.fileUploadedSoFar(current_process().name)              
                    #    }
                    #logToMongo("mongodb://172.23.67.160:27017","search","file_index_cycle_log",logDoc,"SearchUpdateLogs")

