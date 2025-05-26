# -*- coding: utf-8 -*-
import codecs
import json
import os
from SearchHelpingFunctions import logToFileAndConsole
from os.path import abspath,isfile, join
import inspect
from datetime import datetime

class ParamTableClass:
    """This class uploades variables from file with parameters and can update them"""
    def __init__(self,path):


        param_file = codecs.open(path,'r','utf-8-sig')
        param_text = param_file.read()
        param_file.close() #Закрываем файл с параметрами
        param_json = json.loads(param_text)

        self.homePath = param_json["homePath"]

        #Check is folder exists. If not - take the forder of the file in which the code is beeng executed
        self.LogDir = join(self.homePath,param_json["LogDir"])
        self.TempDir = join(self.homePath,param_json["TempDir"])
        self.inggestProgressLog = "IngestProgressLog.log"
        #self.formatsList = param_json["NonImageFileFormat"]
        self.source = param_json["Source"]
        self.mongourl = param_json["Mongo"]["url"]
        self.mongodb = param_json["Mongo"]["db"]
        self.regyme = param_json["AppType"]
        self.index_pairs = param_json["IndexPairs"]
        self.max_threads_list = param_json["MaxThreads"]
        self.max_load_list=param_json["MaxThreadLoad"]
        self.file_types = param_json["file_types"]
        self.file_category = param_json["file_category"]
        self.multithred = param_json["Multithred"]
        self.tika = param_json["Tika"]




