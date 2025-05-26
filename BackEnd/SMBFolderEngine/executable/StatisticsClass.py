# -*- coding: utf-8 -*-
from datetime import datetime
import time



class Statistics:
    def __init__(self):

        ##Cycles management
        self.cycle_number_image =0
        self.cycle_number_other =0

        self.cycleId_image=''
        self.cycleId_other=''

        #Index mangement
        self.indexInfoDict_image = "Undefined yet"
        self.indexInfoDict_other = "Undefined yet"

        self.indexStartDateTime_image = None
        self.indexStartDateTime_other = None

        #Placeholders management
        self.placeholder_name_image = "Undefined yet"
        self.placeholder_name_other = "Undefined yet"

        #Threads 
        self.number_of_threads=0

        

        #files management
        self.count_processed_throught = 0

        self.files_processed_image=0
        self.files_processed_other=0
        
        self.files_in_process_image = 0
        self.files_in_process_other = 0
        
        self.files_uploaded_image=0
        self.files_uploaded_other=0

    def fileProcessingStarted(self,_type):
        #Increase count of files in progress

        if _type=="image":
            self.files_in_process_image=self.files_in_process_image+1
        else:
            self.files_in_process_other=self.files_in_process_other+1

    def fileUploaded(self,_type):
        #Increase count of files in crogress
        if _type=="image":
            self.files_uploaded_image=self.files_uploaded_image+1
        else:
            self.files_uploaded_other=self.files_uploaded_other+1

    def fileProcessingFinished(self,_type):
        #Decrease count of files in progress and increase count of files processed
        self.count_processed_throught=self.count_processed_throught+1
        if _type=="image":
            self.files_in_process_image=self.files_in_process_image-1
            self.files_processed_image=self.files_processed_image+1
        else:
            self.files_in_process_other=self.files_in_process_other-1
            self.files_processed_other=self.files_processed_other+1

    def fileProcessingCurrent(self,_type):
        #Returns current number of files in process
        if _type=="image":

            return self.files_in_process_image
        else:

            return self.files_in_process_other

    def fileProcessedSoFar(self,_type):
        #Returns number of files processed
        if _type=="image":
            return self.files_processed_image
        else:
            return self.files_processed_other

    def fileUploadedSoFar(self,_type):
        #Returns number of files processed
        if _type=="image":
            return self.files_uploaded_image
        else:
            return self.files_uploaded_other

    def placeholderStart(self,_type,_placeholder):
        #Resets count of files processed and uploaded during revious placeholder scan
        if _type=="image":
            self.files_processed_image=0
            self.files_uploaded_image=0
            self.placeholder_name_image=_placeholder
        else:
            self.files_processed_other=0
            self.files_uploaded_other=0   
            self.placeholder_name_other =_placeholder

    def placeholderCurrent(self,_type):
        #Returns current Name of index
        if _type=='image':
            return placeholder_name_image
        else:
            return placeholder_name_other

    def cycleStart(self,_type):
        #Adds one number to cycle count
        self.count_processed_throught = 0
        if _type=='image':
            self.cycleId_image = int(time.time())
            self.cycle_number_image=self.cycle_number_image+1
        else:
            self.cycleId_other = int(time.time())
            self.cycle_number_other=self.cycle_number_other+1
            
    def cycleCurrentNumber(self,_type):
        #Returns current count of cycles
        if _type=='image':
            return self.cycle_number_image
        else:
            return self.cycle_number_other

    def cycleCurrentId(self,_type):
        #Returns current id of cycles
        if _type=='image':
            return self.cycleId_image
        else:
            return self.cycleId_other
    
    def indexStart(self,_type,_indexInfoDict):
        #Fixes main info on index
        if _type=='image':
            self.indexInfoDict_image = _indexInfoDict
            self.indexStartDateTime_image = datetime.now()
        else:
            self.indexInfoDict_other = _indexInfoDict
            self.indexStartDateTime_other = datetime.now()

    def indexCurrentName(self,_type):
        #Returns current Name of index
        if _type=='image':
            return list(self.indexInfoDict_image)[0]
        else:
            return list(self.indexInfoDict_other)[0]

    def indexCurrentFolderName(self,_type):
        #Returns current Name of index
        if _type=='image':
            return self.indexInfoDict_image[list(self.indexInfoDict_image)[0]]["folderName"]
        else:
            return self.indexInfoDict_other[list(self.indexInfoDict_other)[0]]["folderName"]


    def threadsCurrentNumber(self):
        #Returns current count of cycles
            return self.number_of_threads




