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
import win32net
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

def NonImageFilesFromat(filePath):
    formatsList = ParTable.formatsList
    for format in formatsList:
        if filePath.name.lower().endswith(format.lower()):
            return 1
    return 0

def whenExit():
    logToFileAndConsole(os.path.dirname(abspath(inspect.getsourcefile(lambda:0))),"ApplicationErrors.log","STOP",current_process().name,"App is stopped")

class IndexThread(threading.Thread):
        
    def __init__(self, file,ParTable,es,stat):
        """Инициализация потока"""
        threading.Thread.__init__(self)
        self.file = file
        self.source = ParTable.source
        self.streamType = current_process().name
        self.index_name = stat.indexCurrentName(self.streamType)
        self.folderName=stat.indexCurrentFolderName(self.streamType)
        self.regyme=ParTable.regyme
        self.LogDir=ParTable.LogDir
        
        self.ParTable=ParTable
        self.es=es
        self.stat=stat
        self.fileBox = FileContainer(self.file)

        if self.streamType=="image":
            self.stat.number_of_threads_image=self.stat.number_of_threads_image+1
        else:
            self.stat.number_of_threads_other=self.stat.number_of_threads_other+1

    def __del__(self):
        if self.streamType=="image":
            self.stat.number_of_threads_image=self.stat.number_of_threads_image-1
        else:
            self.stat.number_of_threads_other=self.stat.number_of_threads_other-1
    
    def run(self):
        
        try:
            """Запуск потока"""
            
            self.stat.fileProcessingStarted(current_process().name)
            no_of_threads=self.stat.fileProcessingCurrent(current_process().name)
            process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,num=fileIndex(self,self.stat)
            print_str=str(self.stat.count_processed_throught) +" "+str(no_of_threads)+" "+process_result+" "+file_format+" "+str(duration)+" "+file_size_str+" "+file_name+" ID: "+ doc_id +" created: "+file_created_by+"_"+file_created_date+" modyfied: "+file_last_modified_by+"_"+file_last_modified_date+" Pages: "+str(file_pages)+" textlen:"+str(file_content_ru_lenth)+" Attach: "+str(file_attachments_num)+" "+file_attachments_list+"  "+str(num)
                
            if not process_result in ["ALREADY IN INDEX"]:
                logToFileAndConsole(self.LogDir,"UploadedFiles.log",print_str)
                self.stat.fileUploaded(current_process().name)
                
            self.stat.fileProcessingFinished(current_process().name)

   
        except Exception as e:

            self.stat.fileProcessingFinished(current_process().name)
            logToFileAndConsole(self.LogDir,"ApplicationErrors.log","Function","Run",self.regyme,self.file,e)
        
def CycleRun(ParamTablaPath):
    
    try:
        global stat #From main to every process we can pass variable with global.

        #Initialise class that handles table with parameters
        ParTable = ParamTableClass(ParamTablaPath)

        #Создаем подключение к ES
        es = ES_write().connection

        while True:
            stat.cycleStart(current_process().name)

            ParTable.update() #update values from param table for current cycle

            P_Source = ParTable.source
            regyme = ParTable.regyme
            P_IndexPairs = ParTable.index_pairs

            if current_process().name =="image":
                P_MaxThreads = ParTable.max_threads_image_list[1]
            else:
                P_MaxThreads = ParTable.max_threads_other_list[1]

            for indexPair in P_IndexPairs:
                print(current_process().name,"indexPair",indexPair)

                stat.indexStart(current_process().name,indexPair)

                P_IndexName=list(indexPair)[0]
                P_DirPathlist =  indexPair[P_IndexName]["path"]
        
                #P_DirPathlist =  [r'\\aorti.ru\share\РТИ USGAAP']
                #P_DirPathlist =  [r'\\aorti.ru\share\РТИ USGAAP\Working papers\SearchTest']
                #P_DirPathlist =  [r'D:\RTISearch\Samples']
                
                for dirPath in P_DirPathlist:

                
                    basepath = Path(dirPath)
                    if not basepath.exists():
                        logToFileAndConsole(ParTable.LogDir,"ApplicationErrors.log","Unit","Path is unreachable:" + str(basepath))
                        continue

                    #sd = win32security.GetFileSecurity(DirPath, win32security.GROUP_SECURITY_INFORMATION)
                    #a = win32security.LookupAccountSid(win32net.NetGetAnyDCName(), sd.GetSecurityDescriptorGroup())
                    
                    if current_process().name =="image":
                        placeholderlist = ParTable.allowed_image_files_list
                    else:
                        placeholderlist = ParTable.allowed_other_files_list
                    
                    
                    for placeholder in placeholderlist:
             

                        stat.placeholderStart(current_process().name,placeholder)

                        start_time = datetime.now()
                        n=0
                        for file in basepath.rglob(placeholder):
                            n=1+n
                         
                      
            
                            if "~$" in str(file): # ignore temp files
                                continue
                            while True:   

                                files_in_process=stat.fileProcessingCurrent(current_process().name)

                    
                                if files_in_process<=P_MaxThreads:
                                    break
                      
                                #time.sleep(3)
               

                                msg="\n" + current_process().name + " | Current files: " + str(files_in_process)
                                print(msg)
                                #Обновляем MaxThread "на лету"
                                try:
                                    memory_available_perc = round(1-psutil.virtual_memory().available/psutil.virtual_memory().total,4)
                            
                                    print(memory_available_perc)

                                    if memory_available_perc<ParTable.max_load_list[0]:
                              
                                        if current_process().name =="image":
                                            P_MaxThreads = ParTable.max_threads_image_list[0]
                                        else:
                                            P_MaxThreads = ParTable.max_threads_other_list[0]

                                    elif  memory_available_perc<ParTable.max_load_list[1]:
                                   
                                        if current_process().name =="image":
                                            P_MaxThreads = ParTable.max_threads_image_list[1]
                                        else:
                                            P_MaxThreads = ParTable.max_threads_other_list[1]
                                       
                                    else:
                          
                                        if current_process().name =="image":
                                            P_MaxThreads = ParTable.max_threads_image_list[2]
                                        else:
                                            P_MaxThreads = ParTable.max_threads_other_list[2]
                              

                                except Exception as e:
                           
                                    logToFileAndConsole(ParTable.LogDir,"ApplicationErrors.log","Unit","MaxThread update failed" + param_file_path,e)
                                                       
                            #Вызываем функцию индексации
                            #activeThreadsList =threading.enumerate() #Get list of active threads excluding Main (first in th list)

                            #del activeThreadsList[0]

                            #if stat.threadsCurrentNumber(current_process().name)!=files_in_process:
                            #    logToFileAndConsole(ParTable.LogDir,"CurrentThreads.log",files_in_process,stat.threadsCurrentNumber(current_process().name),len(activeThreadsList),activeThreadsList) #For testing 
                            
                            x=IndexThread(file,ParTable,es,stat)
                            x.setDaemon(True)
                            x.start()

                            msg="\nAdded +1 | " + current_process().name + " | Current files: " + str(files_in_process)
                            print(msg)


                        logToFileAndConsole(ParTable.LogDir,"CyclesPart"+regyme+".log",placeholder,dirPath,current_process().name,stat.cycleCurrentNumber(current_process().name),stat.cycleCurrentId(current_process().name),format(datetime.now() - start_time),stat.fileProcessedSoFar(current_process().name),stat.fileUploadedSoFar(current_process().name))
                        logDoc = {
                            "file_format": placeholder,
                            "datetime": format(datetime.now()),
                            "folder_path":dirPath,
                            "process_name":current_process().name,
                            "cycle_count":stat.cycleCurrentNumber(current_process().name),
                            "cycle_id":stat.cycleCurrentId(current_process().name),
                            "cycle_duration":format(datetime.now() - start_time),
                            "files_scanned":stat.fileProcessedSoFar(current_process().name),
                            "files_uploaded":stat.fileUploadedSoFar(current_process().name)              
                            }
                        #logToMongo("mongodb://172.23.67.160:27017","search","file_index_cycle_log",logDoc,"SearchUpdateLogs")

    except Exception as e:
        logToFileAndConsole(ParTable.LogDir,"ApplicationErrors.log","Function","CycleRun",current_process().name,stat.cycleCurrentNumber(current_process().name),stat.cycleCurrentId(current_process().name),regyme,e)

#Включаяем функцию, которая вызовет whenExit при завершении программы
atexit.register(whenExit)

#Initialize statisticall class. It is later passed to each process throurh global variable
stat =Statistics()

#Get path to param file from list of parameters. Or take fixed path in debug mode.
argumentsList = sys.argv
if len(argumentsList)>1:
    ParamTablaPath = argumentsList[1]
else:
    if __debug__:
        ParamTablaPath = "C:\search\etl\config\FileUpdatingParam.json"
    else:
        print("ERROR",format(datetime.now()),"Укажите путь к файлу с параметрами")
        exit()


if __name__ == '__main__':
    #Запусаем 2 отдельных процесса. Для изображений и для всего остального. Чтобы распознание изображений не держало обновление остальных файлов.
    procs = []

    proc1 = Process(target=CycleRun, name="other", args=(ParamTablaPath,))
    procs.append(proc1)
    proc1.start()
     
    proc2 = Process(target=CycleRun, name="image", args=(ParamTablaPath,))
    procs.append(proc2)
    proc2.start()

