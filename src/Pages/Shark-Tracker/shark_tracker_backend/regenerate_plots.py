import os
from pathlib import Path
from data_pipeline import SharkDataPipeline
from data_analysis import SharkDataAnalyzer

def regenerate_plots():
    # Get the absolute path to the backend directory
    backend_dir = Path(__file__).parent.absolute()
    
    # Initialize pipeline and analyzer
    pipeline = SharkDataPipeline()
    pipeline.load_raw_data()
    analyzer = SharkDataAnalyzer(pipeline.db_path)
    
    # Create or clear plots directory (using same path as API)
    plots_dir = backend_dir / "plots"
    if plots_dir.exists():
        # Remove existing plot files
        for file in plots_dir.glob("*.png"):
            print(f"Removing old plot: {file}")
            file.unlink()
    else:
        print(f"Creating plots directory at: {plots_dir}")
        plots_dir.mkdir()
    
    # Generate new plots for all sharks
    shark_ids = analyzer.get_shark_ids()
    for shark_id in shark_ids:
        plot_path = plots_dir / f"shark_{shark_id}.png"
        print(f"Generating plot for shark {shark_id} at: {plot_path}")
        analyzer.plot_single_shark(shark_id, plot_path)
    
    print("All plots regenerated successfully!")
    print(f"Plots are located in: {plots_dir}")

if __name__ == "__main__":
    regenerate_plots()