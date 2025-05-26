# -*- coding: utf-8 -*-
from pathlib import Path
import psutil
import ssl
import hashlib
#from elasticsearch.connection import create_ssl_context
from datetime import datetime
from elasticsearch import Elasticsearch
from StatisticsClass import Statistics
import time
import os
from multiprocessing import Process, current_process
import math
import shutil
import os
import re
import json
from os.path import isfile, abspath,isfile, join
import logging
from lxml import etree as et
import xml.etree.ElementTree as ET
import tika
tika.initVM()
from tika import parser
from tika import detector
from tika import config
from tika import language
from tika import translate
from bs4 import BeautifulSoup
from pdf2image import convert_from_path
import pdf2image
import pytesseract
import img2pdf
try:
    from PIL import Image
except ImportError:
    import Image
from SearchHelpingFunctions import logToFileAndConsole
from SearchHelpingFunctions import GetPermissionsList
from SearchHelpingFunctions import spaceBeforeExtension
from SearchHelpingFunctions import PermissionsToDict
from SearchHelpingFunctions import DictFilterToString
from SearchHelpingFunctions import FullNamesToShortNames
from SearchHelpingFunctions import fileFormat
from SearchHelpingFunctions import filesize_byte_to_str
from SearchHelpingFunctions import ES_write
from ParamTableClass import ParamTableClass


def index_to_es(self,_file_content_ru,_file_timestamp,_file_size_byte,_action_link,_file_folder,_doc_id,_process_result,_file_format,_file_size_str,_file_name,_file_created_by,_file_created_date,_file_last_modified_by,_file_last_modified_date,_file_pages,_file_content_ru_lenth,_file_attachments_num,_file_attachments_list,_duration,_format_tech,_permissions,stat):
           
    try:
        ParTable =self.ParTable
        index_name = self.index_name
        folder_name = self.folderName
        filepath = self.file
        es = self.es
        mongo = self.mongo

        _result="Request not sent"
        #Конвертируем datetime delta в секунды
        _duration=int(_duration.total_seconds())
        #Конвертируем кол-во страниц в integer
        _file_pages=int(_file_pages)
                
        #Subdivide string for parts not longer then 100000 chars
        content_max_char_lenth = 100000
                
        NumOfParts = math.ceil(len(_file_content_ru)/content_max_char_lenth)

        if NumOfParts == 0:
            NumOfParts=1

        #For Excel always 100000. Take only first part
        if _file_format=="Excel":
            NumOfParts=1

        #Заменяем пустые значения на заглушку
        if _file_last_modified_by.strip() =="":
            _file_last_modified_by = "Не известен"

        #Заменяем пустые значения на заглушку
        if _file_created_by.strip() =="":
            _file_created_by = "Не известен"

        for part in range(0,NumOfParts,1):
            start_margin = part*content_max_char_lenth
            end_margin = content_max_char_lenth*(part+1)
            file_content_ru_part=_file_content_ru[start_margin:end_margin]

            #Add protocol
            #_action_link= "explorer_reff:///"+_action_link
            #_file_folder="explorer_reff:///"+_file_folder
            NumPartsAsString = str(part+1) + "/" + str(NumOfParts)
            if NumOfParts>1:
                doc_id_plus = _doc_id + "@" + str(part+1)
            else:
                doc_id_plus = _doc_id
                    
            #Makes name shorter
            _file_last_modified_by=FullNamesToShortNames(_file_last_modified_by)
            _file_created_by=FullNamesToShortNames(_file_created_by)
                                
            sting = PermissionsToDict(_permissions)
            permissionsdict=sting.get_dict()
            
            requestMainPart= {"source":ParTable.source,"folder_name":folder_name,"folder_link":_file_folder,"id":_doc_id,"file_part":NumPartsAsString,"file_process_result":_process_result,"file_content_ru_lenth":_file_content_ru_lenth,"parsing_time":_duration, "file_folder":_file_folder,"action_link":_action_link,"filename": _file_name,"filename_keyword": _file_name,"filesize_byte":_file_size_byte,"filesize_str":_file_size_str,"file_pages":_file_pages,"file_created_by":_file_created_by,"file_last_modified_by":_file_last_modified_by,"date_last_modyfied":_file_last_modified_date,"file_created_date":_file_created_date,"timestamp":_file_timestamp, "format": _file_format,"format_tech":_format_tech,"file_content_ru": file_content_ru_part,"file_attachments_list":_file_attachments_list,"file_attachments_num":_file_attachments_num}
                   
            request = {**requestMainPart,**permissionsdict}
            count=0
            #Cycle is needed in case from the first time info will not be accepted by index
            while True:
                try:
                    _result = es.index(index=index_name, id=doc_id_plus, body=request)
                                                        
                    break
                except Exception as e:
                        
                    count=count+1

                    if count>10:
                        memory_available_perc = str(round(psutil.virtual_memory().available*100/psutil.virtual_memory().total,2))+"%"
                        mongo.mongo_apperrlog({"func_name":"index_to_es","func_place":"INDEX ERROR>10","error":str(e),"exception_type":type(e).__name__,"exception_arg":e.args,"err_type":"Elastic","file_path":_action_link,"doc_id":doc_id_plus})
                        logToFileAndConsole(ParTable.LogDir,"ElasticSearchError.log","INDEX ERROR>10","Memory available " + memory_available_perc,_file_format,_file_content_ru_lenth,_action_link,str(e))
        
        return _result
    except Exception as e:
        mongo.mongo_apperrlog({"func_name":"index_to_es","func_place":"Overall exception","error":str(e),"exception_type":type(e).__name__,"err_type":"Syntax error","file_path":_action_link,"doc_id":doc_id_plus})
        logToFileAndConsole(self.LogDir,"ApplicationErrors.log","Function","index_to_es",self.file,e)

def text_layer_quality(text):
    #Если функция фозвращает 1, значит качество текса хорошее. Если 0 - плохое.

    if text is None:
        return 0

    textStripped = text.replace("\n","").replace("\r","")
    
    if textStripped=="":
        return 0
    else:
        RegExObject = re.search('(?:[а-яa-z]+\s){5}', textStripped)
        if RegExObject is None:
            return 0.
        else:
            return 1


def defineRoot(_html):
    try:
        root = ET.fromstring(_html)
    except: #Структура xhtml может быть повреждена. В этом случае чиним ее с помощью BS
        soup = BeautifulSoup(_html,features="lxml")
        root = ET.fromstring(str(soup))

    return root

def readPDF(_file_input,_format,ParTable,mongo): 

    try:
        _readPDF_result="OK"

        file_path = str(_file_input)
 

        #If full path to file exceeds 255 chars it will not be read. So we copy it to temp folder. And point path_name to temp folder
        path_name_lenth=len(file_path)
        if path_name_lenth>255:
            file_path=shutil.copy(file_path, ParTable.TempDir)
            _readPDF_result="WARN: Too long file path and name"

        if _format=="PDF":
            #ImageList = pdf2image.convert_from_path(pdf_path=file_path,thread_count=1, output_folder=TempDir, fmt="jpeg") #На случай, если будет перегрузка памяти
            try:
                #ImageList = pdf2image.convert_from_path(pdf_path=file_path,thread_count=1,fmt="jpeg")
      
                ImageList = pdf2image.convert_from_path(pdf_path=file_path,thread_count=1,strict=False)
 
            except Exception as e:
                print(e,file_path)
                _readPDF_result = "Содержание файла повреждено"
                NoPages=0
                Text=""
                return _readPDF_result,NoPages,Text
        else:
            try:
                if _format in ["GIF","PNG","JPEG","BMP"]:
                    ImageList=list()
                    ImageList.append(Image.open(file_path))
                else:
                    PDF = img2pdf.convert(file_path) #Переводим формат изображения в PDF
                    ImageList= pdf2image.convert_from_bytes(PDF,thread_count=1) #Переводим назад в изображение с разбивкой на страницы
            except Exception as e:
                _readPDF_result = "Ошибка распозначания (OCR)"

                NoPages=0
                Text=""
                return _readPDF_result,NoPages, Text
        if path_name_lenth>255:
            try:
                os.remove(file_path)
            except Exception as e:  ## if failed
                _readPDF_result = "ERROR deleting temp file"
                NoPages=0
                Text=""
                return _readPDF_result,NoPages,Text

        #text_list=list()
        Text=""
        count=0
        #print("\n",file_name)
        try:
            for page in ImageList:
                #text = pytesseract.image_to_string(page, lang='rus+eng+fra+ita+chi_sim+jpn+deu+spa+ara+por')
                
                custom_config = r'-c preserve_interword_spaces=1 --psm 4'
                text_extracted = pytesseract.image_to_string(page, lang='rus+eng', config=custom_config)
                Text = Text + "\n" + text_extracted
                #text_list.append(text)
                #if len(Text)>=100000:
                #    break #When total number of chars exeeds 100000 recognition stops
                count=count+1
                print("\n",count,"%:",round(count/len(ImageList)*100,1),file_path)
        except Exception as e:
            _readPDF_result = "Ошибка распозначания (OCR)"
            NoPages=0
            Text=""
            return _readPDF_result,NoPages, Text

        NoPages=len(ImageList)
        #Text="\n".join(text_list)
    except Exception as e:
        mongo.mongo_apperrlog({"func_name":"readPDF","func_place":"Overal","error":str(e),"exception_type":type(e).__name__,"exception_arg":e.args,"err_type":"Syntax error","file_path":_file_input})
        logToFileAndConsole(ParTable.LogDir,"ApplicationErrors.log","Function","readPDF",_file_input,str(e))

    return _readPDF_result, NoPages, Text

def fileIndex(self,stat):

    try:    
        index_name = self.index_name
        folder_name = self.folderName
        es = self.es
        mongo =self.mongo
        file=self.file
        ParTable=self.ParTable

        res_msg_pass_err="Файл защищен паролем"
        res_msg_ok="OK"
            
        start_time = datetime.now() 
            
        doc_id = self.fileBox.doc_id
        file_timestamp = self.fileBox.file_timestamp
        permissions = self.fileBox.permissions
        file_name = self.fileBox.file_name
        file_format = self.fileBox.file_format
        suffix = self.fileBox.suffix
        file_format_tech = self.fileBox.file_format_tech
        file_size_byte = self.fileBox.file_size_byte
        file_size_str = self.fileBox.file_size_str
        action_link = self.fileBox.action_link
        file_folder = self.fileBox.file_folder
        file_last_modified_date = self.fileBox.file_last_modified_date
            
        file_created_date = self.fileBox.file_created_date

        file_pages = self.fileBox.file_pages
        file_attachments_list =self.fileBox.file_attachments_list
        file_attachments_num = self.fileBox.file_attachments_num
        file_created_by =self.fileBox.file_created_by
        file_last_modified_by=self.fileBox.file_last_modified_by
        file_content_ru = self.fileBox.file_content_ru
        file_content_ru_lenth=self.fileBox.file_content_ru_lenth
    
        #Проверяем, есть ли уже такой документ в индексе и какая у него дата 
        count=0
        print("fileIndex","checkpoint 2")
        while True:
            try:
                request = {"query": {"term": {"id.keyword":doc_id}}}
                
                #searchResult = es.get(index=index_name, id=doc_id,filter_path=['found',"_source.timestamp","_source.file_process_result","_source.permissions"], ignore=[400, 404])         
                searchResult = es.search(index=index_name, body=request, ignore=[400, 404])
                
                #print("reply",searchResult)
                found = searchResult["hits"]["total"]["value"]
                print("found",found)
                if found:
                    #Check if file was changed since last indexing and it was indexed successfully
                    timestamp = searchResult["hits"]["hits"][0]["_source"]["timestamp"]
                    index_result =searchResult["hits"]["hits"][0]["_source"]["file_process_result"]
                    if  timestamp <  file_timestamp and not index_result in [res_msg_pass_err,res_msg_ok]:
                        #deleteResult = es.delete(index=index_name, id=doc_id, ignore=[400, 404])
                        deleteResult = es.delete_by_query(index=index_name, body=request, ignore=[400, 404])
                    else:
                        #Check if permissions in index = current permissions
                        index_results_source =searchResult["hits"]["hits"][0]["_source"]
                            
                        dictionary = DictFilterToString(index_results_source)
                        index_permissions = dictionary.get_matching_string("permission")

                           
                        if index_permissions==permissions:
                            process_result = "ALREADY IN INDEX"
                            print(stat.count_processed_throught,process_result,action_link,doc_id,"\n")
                        else:
                            sting = PermissionsToDict(permissions)
                            permissionsdict=sting.get_dict()
                            index_results=searchResult["hits"]["hits"]
                                
                            print(index_permissions,"||||",permissions)
                            process_result = "ALREADY IN INDEX UPDATED PERMISSIONS"
                            for result in index_results:
                                doc_id = result["_id"]  
                                for key in result["_source"]:
                                    if "permission" in key:
                                        value = "ctx._source.remove(\"" + key + "\")"
                                        deletefieldbody={"script" : value}
                                        updateResult = es.update(index=index_name, id=doc_id,body=deletefieldbody, ignore=[400, 404])

                                updatebody={"doc" : permissionsdict}
                                updateResult = es.update(index=index_name, id=doc_id,body=updatebody, ignore=[400, 404])
                            print(stat.count_processed_throught,process_result,action_link,doc_id,"\n")
                        duration = format(datetime.now() - start_time)

                        return process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,0
                break
            except Exception as e:
                    
                count=count+1
                memory_available_perc = str(round(psutil.virtual_memory().available*100/psutil.virtual_memory().total,2))+"%"
                if count>10:
                    mongo.mongo_apperrlog({"func_name":"fileIndex","func_place":"GET ERROR>10","error":str(e),"exception_type":type(e).__name__,"exception_arg":e.args,"err_type":"Elastic","file_path":str(file),"Memory available %":memory_available_perc,"doc_id":doc_id})
                    logToFileAndConsole(ParTable.LogDir,"ElasticSearchError.log","Unit","GET ERROR>10","Memory available % " + memory_available_perc,action_link,doc_id,e)


        if file_format in ["Excel","Word","Power Point","PDF","TXT","RTF","SQL","JSON","JS","GZIP","ZIP","RAR"]:
            status = 400
            count=0
     
            while True:
                try:
                    extractedXml = parser.from_file(str(file), ParTable.tika,service='all',xmlContent=True, requestOptions={'timeout': 1200000})
                    
                    status = extractedXml["status"]

                    if status!=200:
                        mongo.mongo_tikastatuslog({"func_name":"fileIndex","func_place":"Tika request","file_path":str(file),"status":status})
                except Exception as e:
                    pass
                    #print(file_name,status,str(e))
                    
                #При неуспешном извлечении заканчиваем обработку файла   
                if not status==200:
                    if count>10:
                        process_result = "Содержание файла повреждено"

                        duration = datetime.now() - start_time
                    
                        #Отправляем в Index
                        result = index_to_es(self,file_content_ru,file_timestamp,file_size_byte,action_link,file_folder,doc_id,process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,file_format_tech,permissions,stat)
                        mongo.mongo_apperrlog({"func_name":"fileIndex","func_place":"Get <> 10 tries","exception_type":type(e).__name__,"error":str(e),"exception_arg":e.args,"err_type":"Tika <> 200 response","file_path":str(file),"doc_id":doc_id})
                        return process_result, file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,1
                    count=count+1
                else:
                    break
            #Проверяем, не защищен ли файл паролем на чтение
    
            metadata = extractedXml["metadata"]

            if "document is encrypted" in str(metadata).lower():
                                        
                process_result = res_msg_pass_err
                duration = datetime.now() - start_time

                #Отправляем в Index
                result = index_to_es(self,file_content_ru,file_timestamp,file_size_byte,action_link,file_folder,doc_id,process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,file_format_tech,permissions,stat)
                    
                return process_result, file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,2
                               
            #Делим полученный текст на отдельные файлы и выбираем первый, чтобы отсеч вложения
            try:
                html_content = extractedXml["content"]
                    
                #Если в файле нет содержания - заканчиваем обработку досрочно. Это не считается ошибкой, поэтому результат = ОК
                if html_content is None:
                    process_result = "OK"
                    file_content_ru=""
                    file_pages=0
                    file_content_ru_lenth=0
                    file_attachments_num=0
                    duration = datetime.now() - start_time
                        
                    #Отправляем в Index
                    result = index_to_es(self,file_content_ru,file_timestamp,file_size_byte,action_link,file_folder,doc_id,process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,file_format_tech,permissions,stat)
                        
                    return process_result, file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,3

                html_list=html_content.strip().replace("</html><html","</html>абцsplitабц<html").split("абцsplitабц")

            except Exception as e:
          
                process_result = "HTML PROCEESING ERROR"
                mongo.mongo_apperrlog({"func_name":"fileIndex","func_place":"HTML PROCEESING ERROR","error":str(e),"exception_type":type(e).__name__,"exception_arg":e.args,"err_type":"HTML PROCEESING ERROR","file_path":str(file),"doc_id":doc_id})
                logToFileAndConsole(ParTable.LogDir,"ProcessingErrors.log",process_result,action_link,str(e))
                duration = datetime.now() - start_time
                    
                #Отправляем в Index
                result = index_to_es(self,file_content_ru,file_timestamp,file_size_byte,action_link,file_folder,doc_id,process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,file_format_tech,permissions,stat)
                    
                return process_result, file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,4
                
            html_first=re.sub("<td>ERROR<\/td>|<td>ERROR:#REF!<\/td>|<td>[()\d\.\,\-\s\+%]+<\/td>","<td></td>",html_list[0])#Удаляем ячейки, где только цифры, чтобы уменьшить объем данных для хранения в индексе, т.к. цифры не полезны для поиска
            root = defineRoot(html_first)
    
            #Достаем из метаданных имя автора, последнего вносившего изменения кол-во страниц
            metas_list = root.iter('{http://www.w3.org/1999/xhtml}meta')
            for meta in metas_list:
                meta_name = meta.get('name')
                meta_content = meta.get('content')
                if  meta_name in ["dc:creator","creator","meta:author","Author"] and file_created_by=="Не известен" and meta_content!="":
                    file_created_by=meta_content
            
                elif meta_name in ["meta:last-author","Last-Author"] and file_last_modified_by=="Не известен" and meta_content!="":
                    file_last_modified_by=meta_content

                elif meta_name in ["Page-Count","meta:page-count","xmpTPg:NPages"] and file_pages==-1:
                    file_pages=meta_content

            if not file_format in ["Excel","Word","Power Point"]:
                if file_created_by=="Не известен":
                    file_created_by = "Сканер"
                    file_last_modified_by = "Сканер"
                else:
                    file_last_modified_by=file_created_by

            #Достаем текст документа, обрабатываем и считаем кол-во символов
            body = root.find('{http://www.w3.org/1999/xhtml}body')
        
   
            if body is None:
                file_content_ru=""
                process_result="Содержание файла повреждено"
    
                duration=datetime.now() - start_time
                #отправляем в индекс
                result = index_to_es(self,file_content_ru,file_timestamp,file_size_byte,action_link,file_folder,doc_id,process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,file_format_tech,permissions,stat)
        
                return process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,5

            body_byte=ET.tostring(body,encoding="utf-8",method="text")
            file_content_ru=body_byte.decode()
            file_content_ru=" ".join(file_content_ru.split()) #убираем лишние пробелы и переносы строк

            file_content_ru_lenth=len(file_content_ru)
        
            #Считаем кол-во страниц для файла Эксель
            if file_format=="Excel":
                h1=body.iter('{http://www.w3.org/1999/xhtml}h1')
                if suffix == "xls": #в файлах такого формата tag h1 используется не только для страниц, но и для вложений. Следующий алгорит нужен для исключения вложений
                    parent_map = [(c,p) for p in body.iter('{http://www.w3.org/1999/xhtml}div') for c in p]
                    sheets_list=list()
                    for el in parent_map:
                        if "h1" in el[0].tag and el[1].get('class')!="package-entry":
                            h1=el[1].iter('{http://www.w3.org/1999/xhtml}h1')
                            temp_list=[t.text for t in h1]
                            sheets_list=sheets_list+temp_list

                else:
                    sheets_list = [t.text for t in h1]
            
                file_pages=len(sheets_list)

                #print("Cтраницы:",sheets_list)
            #Для файла PDF определяем качество текста и если качество плохое - отправляем на распознавание Tysseract
            if file_format =="PDF":
                qualityFlag=text_layer_quality(file_content_ru)
                if qualityFlag==0:
                    readPDF_result,file_pages,file_content_ru=readPDF(file,file_format,ParTable,mongo)
                    file_content_ru_lenth=len(file_content_ru)
                    file_format_tech="PDF_scan"
                    if readPDF_result=="OK":
                        process_result=res_msg_ok
                    else:
                        process_result=readPDF_result
                        
                else:
                    file_format_tech="PDF_text"
                    
            #Определяем кол-во и названия вложенных файлов
            if file_format!="Power Point":
                embed_files_list = extractedXml["metadata"].get("X-TIKA:embedded_resource_path",[])
                embed_files_content_type_list = extractedXml["metadata"].get("Content-Type",[])
                file_attachments_num=len(embed_files_list)
                if file_attachments_num!=0:
                    #Считаем вложения
                    count = 0
                    for embed_file in embed_files_list:
                        path_parts_list = embed_file.split("/")
                        last_part = path_parts_list[len(path_parts_list)-1]
                        f_format, suffix,file_format_tech = fileFormat(last_part)
                        if f_format in ["Excel","Word","PDF"]:
                            count = count +1
                    file_attachments_num=count
                    if file_attachments_num!=0:
                        count=0
                        embed_file_title_list=list()
                        for emb_f in embed_files_content_type_list:
                            if emb_f == "image/unknown":
                                continue
                            if emb_f == "image/emf":
                                root_embed = defineRoot(html_list[count])
                                body_text=ET.tostring(root_embed.find('{http://www.w3.org/1999/xhtml}body'),encoding="utf-8",method="text").decode()
                                body_text = os.path.split(body_text)[1]
                                body_text=re.sub("\\n+|\\r+","",body_text)
                                if len(body_text)>225:
                                    count=count+1
                                    continue
                                embed_file_title_list.append(spaceBeforeExtension(body_text))
                            count=count+1
                        file_attachments_list=" | ".join(embed_file_title_list)    
                            
            else:
                file_attachments_num=0
                file_attachments_list=""
                
            process_result=res_msg_ok
   
        else:
            readPDF_result, file_pages,file_content_ru=readPDF(file,file_format,ParTable,mongo)
            file_created_by = "Сканер"
            file_last_modified_by = "Сканер"
            file_content_ru_lenth=len(file_content_ru)
            file_attachments_list =""
            file_attachments_num = 0
            if readPDF_result=="OK":
                process_result=res_msg_ok
            else:
                process_result=readPDF_result
    
        duration=datetime.now() - start_time
 
        #отправляем в индекс
        result = index_to_es(self,file_content_ru,file_timestamp,file_size_byte,action_link,file_folder,doc_id,process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,file_format_tech,permissions,stat)
        
        return process_result,file_format,file_size_str,file_name,file_created_by,file_created_date,file_last_modified_by,file_last_modified_date,file_pages,file_content_ru_lenth,file_attachments_num,file_attachments_list,duration,doc_id,5
        
    except Exception as e:
         mongo.mongo_apperrlog({"func_name":"fileIndex","func_place":"Ovarall exception","error":str(e),"exception_type":type(e).__name__,"err_type":"Syntax error","exception_arg":e.args,"file_path":str(file),"doc_id":doc_id})
         logToFileAndConsole(ParTable.LogDir,"ApplicationErrors.log","Function","fileIndex",self.file,str(e))
            
class test:
    def __init__(self):
        self.index_name="prsva_search_file_folder_finance"
        self.count_processed_throught = 1
        self.file=Path(r'\\Dfsman-1\fs\Финансы\01 Разовые\010 Справки опцион\соглашение о предоставлении опциона дизельзипсервис.pdf')
        self.folderName = r'\\Dfsman-1\fs\Финансы\01 Разовые\010 Справки опцион'
        self.es = ES_write().connection
        self.ParTable = ParamTableClass("D:\search\etl\config\FileUpdatingParam.json")
        file_format, suffix,file_format_tech = fileFormat(self.file)
        self.format=file_format

#t = test()
#fileIndex(t,Statistics())
#readPDF(t.file,t.format,t.ParTable)

#extractedXml = parser.from_file("\\\\Dfsman-1\\fs\Финансы\\01 Разовые\\015 УК ПС - ЗПИФ ТА\\01 Сбор данных\\Теханалитика_2019.12.12.факт.pdf", 'http://localhost:9998',service='all',xmlContent=True, requestOptions={'timeout': 1200})
#print(extractedXml)
