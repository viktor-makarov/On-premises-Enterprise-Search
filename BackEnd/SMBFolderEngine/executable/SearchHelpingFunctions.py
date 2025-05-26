# -*- coding: utf-8 -*-

import os
from os.path import abspath,isfile, join
import inspect
import codecs
from elasticsearch import Elasticsearch, client
from datetime import datetime
try:
    import win32security
except:
    pass
import time
import re
# подключено для того, чтобы в консоли постоянно модуль requests не выводил, что соединение происходит с неверифицированным сертификатом
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

def logToFileAndConsole(_fileFolder,_fileName,*args):
    #Функция логирует события в текстовый файл и в консоль
    #_fileFolder = путь к папке, где должен лежать файл с логами Например: "D:\RTISearch\SearchDeleteLogs"
    #_fileName = Имя файла, в который будет писаться лог Например: "ApplicationErrors.log"
    #*args = сюда может прийти любое количество переменных. Все они будут разделены " | " и перечисленны в тексте ошибки
    #Пример запроса функии: logToFileAndConsole(LogDir,"ApplicationErrors.log","Info",format(datetime.now()),"Open param. file: " + param_file_path, "Successfuly", 200)
    
    print("logToFileAndConsole",_fileFolder,_fileName)
    fFolder = str(_fileFolder)
    fName = str(_fileName)
    mess = str(format(datetime.now())) +" | " + ' | '.join(map(str, args))
    print("logToFileAndConsole",mess)

    try:
        if not os.path.exists(fFolder): os.makedirs(fFolder)
        with codecs.open(join(fFolder,fName), 'a','utf-8') as f:
            f.write(mess + "\n")
        print(mess)
        status = "Success"
    except Exception as e:
        #Если записать в указанный файл или каталог не получается - ошибка записывается в специальный лог в корнеком каталоге приложения
        currentPath = os.path.dirname(abspath(inspect.getsourcefile(lambda:0)))
        eRRmess = "ERROR | " + format(datetime.now()) + " | Failed to log event: <" + mess +"> | " + str(e)
        with codecs.open(join(currentPath,"LoggingFailErrors.log"), 'a','utf-8') as f:
            f.write(eRRmess + "\n")
        print(eRRmess)
        status = "Fail"
    return status #При успешной записи возвражает статус "Success", "Fail" при неуспешной.

def GetPermissionsList(_file):
    #Extract from file information about security permissions ACE = Access Controll Entry
    #_file = pathlib object, representing file or simple path

    try:
        print(str(_file))
        sd = win32security.GetFileSecurity(str(_file), win32security.DACL_SECURITY_INFORMATION)
        dacl = sd.GetSecurityDescriptorDacl()   
        
        AceCount =dacl.GetAceCount() #Number of accounts in assess list
    
        #Extract list of permissions from ACE object
        PermissionsList = list()
        ReadAccessList = [2032127,1179817,1180095,1245631] #[Full,Read,Change]

        CONVENTIONAL_ACES = {
        win32security.ACCESS_ALLOWED_ACE_TYPE : "ALLOW", 
        win32security.ACCESS_DENIED_ACE_TYPE : "DENY"
        }

        for i in range(0,AceCount):
            ACE = dacl.GetAce(i)
            (ace_type, ace_flags) = ACE[0]
            if ace_type in CONVENTIONAL_ACES:
                mask, sid = ACE[1:]
            else:
                mask, object_type, inherited_object_type, sid = ACE[1:]
            try:
                userx, domain, type = win32security.LookupAccountSid (None, sid) #Account name, domain and type by SID
            except Exception as e:
  
               continue
            #if 1245631 in ReadAccessList and domain=="AORTI" and CONVENTIONAL_ACES.get (ace_type, "OTHER")=="ALLOW":
            if mask in ReadAccessList and domain=="PRS-VA" and CONVENTIONAL_ACES.get (ace_type, "OTHER")=="ALLOW":
                PermissionsList.append(userx)
        PermissionsList = list(set(PermissionsList)) #Оставляем в списке только уникальные значения
        PermissionsList.sort() #Сортируем
        PermissionsString = " | ".join(PermissionsList)
    
        return PermissionsString
    except Exception as e:
        print(e)
        logToFileAndConsole(LogDir,"ApplicationErrors.log","Function","GetPermissionsList",str(datetime.now()),_file,e)

class PermissionsToDict(str):
    #Преобразует строку разделенную палками в dictionary
    def get_dict(self):
        try:
            permissionslist=self.split(" | ")
            _permissionsdict ={}
            count=1

            for permission in permissionslist:
                label="permission"+str(count)
                _permissionsdict[label]=permission
                count=count+1
                   
            return _permissionsdict
        except Exception as e:
            logToFileAndConsole(LogDir,"ApplicationErrors.log","Function","GetPermissionsList",str(datetime.now()),str,e)

class DictFilterToString(dict):
    #Преобразует dictionary в строку, разделенную палками
    def get_matching_string(self, event):
        try:
            l =list()
            for key in self:
                if event in key:
                    l.append(self[key])

            l.sort()

            return " | ".join(l)
        except Exception as e:
            logToFileAndConsole(LogDir,"ApplicationErrors.log","Function","GetPermissionsList",str(datetime.now()),dict,e)

def FullNamesToShortNames(_Name):
    try:
        FullName = re.search('[A-ZА-ЯЁ][a-zа-яё]+\s[A-ZА-ЯЁ][a-zа-яё]+\s[A-ZА-ЯЁ][a-zа-яё]+', _Name)
        if not FullName is None:
            FullNameList = FullName.group(0).split()
            if len(FullNameList)==3:
                ShortName = FullNameList[0]+" "+FullNameList[1][:1]+"."+FullNameList[2][:1]+"."
                _Name=ShortName

        return _Name
    except Exception as e:
        logToFileAndConsole(LogDir,"ApplicationErrors.log","Function","GetPermissionsList",str(datetime.now()),_Name,e)

def fileFormat(filePath):
    try:
        if isinstance(filePath, str):
            splitedStr = filePath.split(".")
            suffix=splitedStr[len(splitedStr)-1].upper()
        else:
            suffix = filePath.suffix.upper().replace(".","")

        if "XLS" in suffix:
            return "Excel",suffix.lower(),"Excel"
        elif "PPT" in suffix:
            return "Power Point",suffix.lower(),"Power Point"
        elif "DOC" in suffix:
            return "Word",suffix.lower(),"Word"
        else:
            return suffix,suffix.lower(),suffix
    except Exception as e:
        logToFileAndConsole(LogDir,"ApplicationErrors.log","Function","GetPermissionsList",str(datetime.now()),filePath,e)

def filesize_byte_to_str(sizeint):
    try:
        sizestr=""
        integerlenth = len(str(sizeint))
        if integerlenth<=3:
            sizestr= str(sizeint) + " byte"
        elif integerlenth<=6:
            sizestr= str(round(sizeint/1024,1)) + " Kb"
        elif integerlenth<=9:
            sizestr= str(round(sizeint/1024/1024,1)) + " Mb"
        else:
            sizestr= str(round(sizeint/1024/1024/1024,1)) + " Gb"
        return sizestr
    except Exception as e:
        logToFileAndConsole(LogDir,"ApplicationErrors.log","Function","GetPermissionsList",str(datetime.now()),sizeint,e)

def spaceBeforeExtension(_fileName):
    #Функция добавляет пробел между названием файла и точкой, после которой идет расширение. 
    #Это нужно для более удачного индексирования названий файлов
    #_fileName = полное название файла Например:
    try:
        partlist = _fileName.split(".")
        NumOfParts = len(partlist)
        partlistnew=list()
        if NumOfParts>1:
            for p in range(0,NumOfParts,1):
                if p+1==NumOfParts-1: #for pre-final item we put space in the end
                    partlistnew.append(partlist[p]+" ")
                else:
                    partlistnew.append(partlist[p])
            partlist=partlistnew

        return ".".join(partlist)
    except Exception as e:
        logToFileAndConsole(LogDir,"ApplicationErrors.log","Function","GetPermissionsList",_fileName,e)

class ES_write:
    def __init__(self):
      #  self.hosts = [{'host': '192.168.50.13', 'port': 9200}]

        self.connection = Elasticsearch(hosts=["https://192.168.50.13:9200"], 
                http_auth=('elastic', 'elastic'), verify_certs=False)

        self.client = client.IndicesClient(self.connection)
        #self.connection = Elasticsearch('https://sr-as-3:9200',
                    
                        # use_ssl=True,
                    #      verify_certs=True,
                    #      ca_certs="D:\search\etl\config\ssl\ca.crt",
                    #      http_auth=('elastic', 'elastic')
                        #api_key=('zaxQdnUBjaV01I3E5fpH', 'lFwJ-OSNS0CNtHkTbF_oeQ')
                    #     )

    def check_create_index(self,index_name):
        #Проверям, существует ли индекс
        client = self.client
        result = client.exists(index=[index_name])
        if result:
            return {"index_exists":result}
        else:
            result = client.create(index=[index_name]).body
            return {"index_exists":"false","index_created":index_name,"es_response":result}





#a = GetPermissionsList("\\\\aorti.ru\\share\\РТИ Edif\\ЕДИФ\\РТИ\\АО РТИ\\3-Корпоративное управление\\Советы директоров\\2012\\12 - Протокол СД 6-2012(19) от 23-11-2012.pdf")
#print(a)

