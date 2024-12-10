import pandas as pd
from typing import Dict, List, Tuple, Any
import os
import io
import traceback

class FileValidationError(Exception):
    """Custom exception for file validation errors"""
    pass

class FileProcessor:
    @staticmethod
    def validate_file(file) -> Tuple[bool, str]:
        """Basic validation of file format"""
        try:
            filename = file.filename.lower()
            
            # Check file extension
            if not (filename.endswith('.csv') or filename.endswith('.xlsx')):
                return False, "Please upload a CSV or Excel file"

            # Save the current position of the file pointer
            file.seek(0)
            
            # Read file based on type
            try:
                if filename.endswith('.csv'):
                    df = pd.read_csv(file)
                else:  # Excel
                    df = pd.read_excel(file)
            except Exception as e:
                print(f"Error reading file: {str(e)}")
                print(traceback.format_exc())
                return False, f"Error reading file: {str(e)}"

            # Reset file pointer for future reads
            file.seek(0)

            if df.empty:
                return False, "The file appears to be empty"

            print(f"File validation successful. Found {len(df)} rows")
            return True, "File validation successful"

        except Exception as e:
            print(f"Validation error: {str(e)}")
            print(traceback.format_exc())
            return False, f"Error validating file: {str(e)}"

    @staticmethod
    def get_raw_data(file) -> str:
        """Get raw content of the file"""
        try:
            file.seek(0)
            content = file.read()
            if isinstance(content, bytes):
                content = content.decode('utf-8')
            return content
        except Exception as e:
            print(f"Error reading raw file: {str(e)}")
            print(traceback.format_exc())
            raise FileValidationError(f"Error reading raw file: {str(e)}")

    @staticmethod
    def process_file(file) -> Tuple[Dict[str, Any], str]:
        """Process and normalize the uploaded file"""
        try:
            filename = file.filename.lower()
            file_type = 'csv' if filename.endswith('.csv') else 'excel'

            # Get raw content first
            raw_data = FileProcessor.get_raw_data(file)
            
            # Reset file pointer for processed data
            file.seek(0)
            
            # Read file for processing
            try:
                if file_type == 'csv':
                    df = pd.read_csv(file)
                else:
                    df = pd.read_excel(file)
            except Exception as e:
                print(f"Error reading file during processing: {str(e)}")
                print(traceback.format_exc())
                raise FileValidationError(f"Error reading file: {str(e)}")

            # Basic data cleaning
            df = df.fillna('')  # Replace NaN with empty string
            
            # Convert to list of dictionaries
            processed_data = df.to_dict('records')
            print(f"Processed {len(processed_data)} records")

            return {
                'raw_data': raw_data,
                'processed_data': processed_data,
                'file_type': file_type
            }

        except Exception as e:
            print(f"Processing error: {str(e)}")
            print(traceback.format_exc())
            raise FileValidationError(f"Error processing file: {str(e)}")

    @staticmethod
    def save_file_temporarily(file) -> str:
        """
        Save uploaded file to temporary location
        Returns: temporary file path
        """
        temp_dir = 'temp_uploads'
        os.makedirs(temp_dir, exist_ok=True)
        
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        return temp_path