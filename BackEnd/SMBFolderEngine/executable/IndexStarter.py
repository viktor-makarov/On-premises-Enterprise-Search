from SearchIndexingApp_new import MainFunc
import time
from datetime import datetime

x = MainFunc("C:\\search\\etl\\airflow\\config\\FileUpdatingParam.4.json")
cyclecount=1
while True:
    start_cycle = datetime.now()
    
    fileScannedCount, filesIndexedCount = x.Process()

    cycleduration = format(datetime.now() - start_cycle)
    print("Cycle count: " + str(cyclecount),"Cycle duration: " + cycleduration,"FilesScanned : " + str(fileScannedCount),"Files Indexed :" + str(filesIndexedCount)) 
    cyclecount = cyclecount+1
    time.sleep(900)