import sys
from SearchDeleteFromIndex import DeleteFunc
import time
from datetime import datetime

def main():
    # Check if config path is provided as argument
    if len(sys.argv) < 2:
        print("Usage: python DeleteConsole.py <config_file_path>")
        print("Example: python DeleteConsole.py BackEnd\\SMBFolderEngine\\pipeline_config\\deletion_example.json")
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
    
    print(f"Starting deletion process with config: {config_path}")
    
    try:
        x = DeleteFunc(config_path)
        
        while True:
            cycleduration, cyclecount, filesDeleted = x.Process()
            print(f"Deletion cycle completed - Duration: {cycleduration}, Cycle: {cyclecount}, Files Deleted: {filesDeleted}")
            time.sleep(900)
            
    except KeyboardInterrupt:
        print("\nDeletion process stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"Error during deletion process: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
