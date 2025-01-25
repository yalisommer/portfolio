import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
import numpy as np

class SharkDataAnalyzer:
    def __init__(self, data_path):
        connection_path = sqlite3.connect(str(data_path))
        self.data = pd.read_sql('SELECT * FROM shark_tracking', connection_path)
        self.data['timestamp'] = pd.to_datetime(self.data['timestamp'])
        plt.style.use('dark_background')


    # first method attempt, plots conglomerate
    def plot_track(self):
        # plot basic movement track
        timestamps_numeric = (self.data['timestamp'] - self.data['timestamp'].min()).dt.total_seconds()

        plt.figure(figsize=(12, 8))
        scatter = plt.scatter(
                    self.data['Longitude'],
                    self.data['Latitude'],
                    c = timestamps_numeric,
                    alpha = 0.5,
                    cmap = 'viridis'
        )
        
        
        cbar = plt.colorbar(scatter, label = 'Time')

        tick_locations = np.linspace(timestamps_numeric.min(), timestamps_numeric.max(), 5)
        tick_labels = [self.data['timestamp'].min() + pd.Timedelta(seconds = s) for s in tick_locations]
        cbar.set_ticks(tick_locations)
        cbar.set_ticklabels([t.strftime('%Y-%m-%d') for t in tick_labels])

        plt.xlabel('Longitude')
        plt.ylabel('Latitude')
        plt.title('Great White Shark Movement Track')
        plt.show()

    def get_daily_distances(self):
        # calculate daily movement distances

        daily = self.data.groupby(
            self.data['timestamp'].dt.date
            ).agg({
            'Latitude': ['first', 'last'],
            'Longitude': ['first', 'last']
        })

        return daily
    
    # plot by individal shark
    def get_shark_ids(self):
        """Get list of all unique shark IDs"""
        return sorted(self.data['Shark'].unique().tolist())

    def plot_single_shark(self, shark_id: str, save_path: Path = None):
        """Plot movement track for a single shark and optionally save to file"""
        shark_data = self.data[self.data['Shark'] == shark_id]
        
        if shark_data.empty:
            raise ValueError(f"No data found for shark {shark_id}")

        timestamps_numeric = (shark_data['timestamp'] - shark_data['timestamp'].min()).dt.total_seconds()
        
        plt.figure(figsize=(12, 8))
        scatter = plt.scatter(
            shark_data['Longitude'],
            shark_data['Latitude'],
            c=timestamps_numeric,
            alpha=0.5,
            cmap='viridis'
        )
        
        cbar = plt.colorbar(scatter, label='Time')
        
        tick_locations = np.linspace(timestamps_numeric.min(), timestamps_numeric.max(), 5)
        tick_labels = [shark_data['timestamp'].min() + pd.Timedelta(seconds=s) for s in tick_locations]
        cbar.set_ticks(tick_locations)
        cbar.set_ticklabels([t.strftime('%Y-%m-%d') for t in tick_labels])
        
        plt.xlabel('Longitude')
        plt.ylabel('Latitude')
        plt.title(f'Great White Shark G{shark_id} Movement Track')
        
        if save_path:
            plt.savefig(save_path, bbox_inches='tight')
            plt.close()
        else:
            plt.show()
    
    def get_all_coordinates(self):
        """Get coordinates for all sharks in a format suitable for globe visualization"""
        result = []
        paths = []
        grouped = self.data.groupby('Shark')
        
        # Define unique colors for each shark
        colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
            '#D4A5A5', '#9B59B6', '#3498DB', '#F1C40F', '#E74C3C'
        ]
        
        for idx, (shark_id, shark_data) in enumerate(grouped):
            # Sort data by timestamp
            shark_data = shark_data.sort_values('timestamp')
            latest_position = shark_data.iloc[-1]
            
            # Create a feature for the shark's current position
            shark_feature = {
                'id': shark_id,
                'lat': float(latest_position['Latitude']),
                'lng': float(latest_position['Longitude']),
                'timestamp': latest_position['timestamp'].isoformat(),
                'depth': float(latest_position['Depth']) if pd.notna(latest_position['Depth']) else 0,
                'length': float(latest_position['Length']) if pd.notna(latest_position['Length']) else 0,
                'color': colors[idx % len(colors)]  # Assign color cyclically
            }
            
            # Create path data for this shark
            path_data = []
            total_points = len(shark_data)
            
            for i, row in enumerate(shark_data.itertuples()):
                # Calculate opacity based on position in timeline (0.1 to 1.0)
                opacity = 0.1 + (0.9 * (i / (total_points - 1)))
                
                path_data.append({
                    'lat': float(row.Latitude),
                    'lng': float(row.Longitude),
                    'opacity': opacity
                })
            
            paths.append({
                'sharkId': shark_id,
                'color': colors[idx % len(colors)],
                'points': path_data
            })
            
            result.append(shark_feature)
        
        return {
            'sharks': result,
            'paths': paths,
            'timestamps': {
                'min': self.data['timestamp'].min().isoformat(),
                'max': self.data['timestamp'].max().isoformat()
            }
        }
    
    def plot_track_by_shark(self):
        """Plot movement tracks for all sharks in a grid"""
        grouped = self.data.groupby('Shark')
        
        num_sharks = len(grouped)
        cols = 3
        rows = (num_sharks + cols - 1) // cols
        
        figure, axes = plt.subplots(rows, cols, figsize=(15, 15 * rows), constrained_layout=True)
        axes = axes.flatten()
        
        for idx, (shark_id, shark_data) in enumerate(grouped):
            timestamps_numeric = (shark_data['timestamp'] - shark_data['timestamp'].min()).dt.total_seconds()
            
            scatter = axes[idx].scatter(
                shark_data['Longitude'],
                shark_data['Latitude'],
                c=timestamps_numeric,
                alpha=0.5,
                cmap='viridis'
            )
            
            cbar = figure.colorbar(scatter, ax=axes[idx], label='Time')
            
            tick_locations = np.linspace(timestamps_numeric.min(), timestamps_numeric.max(), 5)
            tick_labels = [shark_data['timestamp'].min() + pd.Timedelta(seconds=s) for s in tick_locations]
            cbar.set_ticks(tick_locations)
            cbar.set_ticklabels([t.strftime('%Y-%m-%d') for t in tick_labels])
            
            axes[idx].set_xlabel('Longitude')
            axes[idx].set_ylabel('Latitude')
            axes[idx].set_title(f'Great White Shark G{shark_id} Movement Track')
        
        for idx in range(num_sharks, len(axes)):
            axes[idx].axis('off')
        
        plt.show()


