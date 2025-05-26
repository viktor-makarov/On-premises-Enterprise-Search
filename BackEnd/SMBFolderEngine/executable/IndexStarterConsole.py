import sys
from SearchIndexingApp_new import MainFunc
import time
from datetime import datetime

def main():
    # Check if config path is provided as argument
    if len(sys.argv) < 2:
        print("Usage: python IndexConsole.py <config_file_path>")
        print("Example: python IndexConsole.py BackEnd\\SMBFolderEngine\\pipeline_config\\ingest_image_based_example.json")
        sys.exit(1)
    
    config_path = sys.argv[1]
    
    # Validate that the config file exists
    try:
        with open(config_path, 'r') as f:
            pass
    except FileNotFoundError:
        print(f"Error: Config file not found: {config_path}")
        sys.exit(1)
    except Exception as e:
        print(f"Error accessing config file: {e}")
        sys.exit(1)
    
    print(f"Starting indexing with config: {config_path}")
    
    try:
        x = MainFunc(config_path)
        cyclecount = 1
        
        while True:
            start_cycle = datetime.now()
            
            fileScannedCount, filesIndexedCount = x.Process()

            cycleduration = format(datetime.now() - start_cycle)
            print("Cycle count: " + str(cyclecount), "Cycle duration: " + cycleduration, "FilesScanned : " + str(fileScannedCount), "Files Indexed :" + str(filesIndexedCount)) 
            cyclecount = cyclecount + 1
            time.sleep(900)
            
    except KeyboardInterrupt:
        print("\nIndexing stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"Error during indexing: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
