import sqlite3
import pandas as pd
from pathlib import Path
import logging

class SharkDataPipeline:
    def __init__(self):
        current_dir = Path(__file__).parent
        self.db_path = current_dir / "data/database/shark_data.db"
        self.raw_data_path = current_dir / "data/seanoeRawDataset"
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            level = logging.INFO, 
            format = '%(asctime)s - %(levelname)s - %(message)s'
        )

    def load_raw_data(self):
        # load/process csv file
        try:
            # set df to the raw data parsed from csv
            df = pd.read_csv(
                self.raw_data_path / "raw_data.csv",
                sep = ';',
                parse_dates = ['DT']
                )

            # clean data
            cleaned_df = self.clean_data(df)

            # save to SQLite
            cleaned_df.to_sql('shark_tracking',
                            sqlite3.connect(str(self.db_path)),
                            if_exists = 'replace',
                            index = False) 

            logging.info(f"Successfully processed data")
            return cleaned_df
        except Exception as e:
            logging.error(f"Error processing data: {str(e)}")
            return None

    def clean_data(self, df):
        
        # standardize column names
        # Shark;Depth;Latitude;Longitude;DT;Sex;Length;Tide;ShoreDistance;Ships number
        df = df.rename(columns = {
            'DT': 'timestamp',
            'ShoreDistance': 'shore_distance',
            'Ships number': 'ships_count' 
        })

        #convert to usable data types
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors = 'coarce')
        df['Depth'] = pd.to_numeric(df['Depth'], errors = 'coerce')
        df['Latitude'] = pd.to_numeric(df['Latitude'], errors = 'coerce')
        df['Length'] = pd.to_numeric(df['Length'], errors = 'coerce')
        df['shore_distance'] = pd.to_numeric(df['shore_distance'], errors = 'coerce')
        df['ships_count'] = pd.to_numeric(df['ships_count'], errors = 'coerce')
        
        df = df.dropna(subset = ['timestamp'])

        # check for invalid cords
        df = df[
            (df['Latitude'].notna()) &
            (df['Longitude'].notna()) &
            (df['Latitude'] >= -90) &
            (df['Longitude'] <= 90) &
            (df['Latitude'] >= -180) &
            (df['Longitude'] <= 180)
            # & (df['Shark'] == "WS1") IF I WANT TO ISOLATE BY SHARK !
        ]

        df['time_dif'] = df.groupby('Shark')['timestamp'].diff()
        return df;

