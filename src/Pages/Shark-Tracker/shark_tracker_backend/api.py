from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import os
import pandas as pd
from data_pipeline import SharkDataPipeline
from data_analysis import SharkDataAnalyzer

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data pipeline and analyzer
pipeline = SharkDataPipeline()
# Load the data first
pipeline.load_raw_data()
# Then initialize the analyzer
analyzer = SharkDataAnalyzer(pipeline.db_path)

# Create plots directory if it doesn't exist
PLOTS_DIR = Path(__file__).parent / "plots"
PLOTS_DIR.mkdir(exist_ok=True)

@app.get("/sharks")
async def get_sharks():
    """Get list of all shark IDs"""
    try:
        sharks = analyzer.get_shark_ids()
        return {"sharks": sharks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sharks/coordinates")
async def get_all_shark_coordinates():
    """Get coordinates for all sharks"""
    try:
        coordinates = analyzer.get_all_coordinates()
        return JSONResponse(content=coordinates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sharks/{shark_id}/plot")
async def get_shark_plot(shark_id: str):
    """Get plot for a specific shark"""
    try:
        plot_path = PLOTS_DIR / f"shark_{shark_id}.png"
        
        # Generate new plot if it doesn't exist
        if not plot_path.exists():
            analyzer.plot_single_shark(shark_id, plot_path)
        
        return FileResponse(plot_path)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))