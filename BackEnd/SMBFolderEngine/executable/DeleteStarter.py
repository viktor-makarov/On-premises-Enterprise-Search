from SearchDeleteFromIndex import DeleteFunc
import time

x = DeleteFunc("C:\\search\\etl\\airflow\\config\\FileDeletingParam.json")
while True:
    cycleduration, cyclecount, filesDeleted = x.Process()
    time.sleep(900)



