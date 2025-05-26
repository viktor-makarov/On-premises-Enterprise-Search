# -*- coding: utf-8 -*-
from datetime import datetime
import time
import psutil
import os
import codecs
import hashlib
from os.path import exists
from pathlib import Path
from os.path import isfile, abspath,isfile, join
from SearchHelpingFunctions import GetPermissionsList, spaceBeforeExtension, fileFormat, filesize_byte_to_str

class FileContainer:
    def __init__(self,_fileObject,mongo):
        try:
            self.error = False
            self.fileObject = _fileObject
            self.processingStart =  datetime.now()
            
            #self.doc_id = str(self.fileObject.parents[len(self.fileObject.parents)-1]).replace("\\","_")+"_"+str(self.fileObject.stat().st_dev)+"_"+str(self.fileObject.stat().st_ino) 

            self.file_timestamp = self.fileObject.stat().st_mtime
            path_and_deviceid = str(_fileObject).replace("\\","_")+"_"+str(_fileObject.stat().st_dev)+"_"+str(_fileObject.stat().st_ino)
            self.doc_id = hashlib.sha256(path_and_deviceid.encode('utf-8')).hexdigest()
            #self.doc_id = str(self.fileObject).replace("\\","").replace(" ","_").replace(".","-")
            
            self.permissions = GetPermissionsList(self.fileObject)
            
            self.file_format, self.suffix,self.file_format_tech = fileFormat(self.fileObject)
            self.file_size_byte = int(self.fileObject.stat().st_size)
            self.file_size_str = filesize_byte_to_str(self.file_size_byte)
            #self.file_name = spaceBeforeExtension(self.fileObject.name)
            self.file_name = self.fileObject.name
            self.action_link = str(self.fileObject )
            self.file_folder = str(self.fileObject .parent)
            self.file_created_date = datetime.fromtimestamp(self.fileObject.stat().st_ctime).strftime('%Y-%m-%d')
            try:
                self.file_last_modified_date = datetime.fromtimestamp(self.fileObject.stat().st_mtime).strftime('%Y-%m-%d')
            except :
                self.file_last_modified_date =None

            if self.file_format in ["Excel","Power Point","Word"]:
                self.file_created_date = datetime.fromtimestamp(self.fileObject.stat().st_ctime).strftime('%Y-%m-%d')
            else:
                self.file_created_date = self.file_last_modified_date

            #Later defined
            self.file_created_by = "Не известен" 
            self.file_last_modified_by = "Не известен"
            self.file_pages = -1
            self.file_content_ru = ""
            self.file_content_ru_lenth = -1
            self.file_attachments_num = -1
            self.file_attachments_list =[]
            self.process_result = "Process not finished yet"
        except Exception as e:
            self.error = True
            mongo.mongo_apperrlog({"func_name":"FileContainer.__init__","error":str(e),"err_type":"File container","file_name":str(_fileObject)})
            raise ValueError('See previous error in FileContainer.__init__')


#t=FileContainer(Path(r'\\aorti.ru\share\РТИ USGAAP\Accounting policy and Memos\ГААП США\1. УЧЕТНАЯ ПОЛИТИКА\РТИ_2013\Скан приказа ГД ОАО РТИ от 31.01.2013 №16.pdf'))
#print(t)