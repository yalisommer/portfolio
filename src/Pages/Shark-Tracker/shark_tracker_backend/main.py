from data_pipeline import SharkDataPipeline
from data_analysis import SharkDataAnalyzer

def main():
    pipeline = SharkDataPipeline()

    tracking_data = pipeline.load_raw_data()

    if tracking_data is not None:
        analyzer = SharkDataAnalyzer(pipeline.db_path)

        analyzer.plot_track_by_shark()

        daily_distances = analyzer.get_daily_distances()
        print("\nDaily Movement Summary:")
        print(daily_distances.describe())

if __name__ == "__main__":
    main() 