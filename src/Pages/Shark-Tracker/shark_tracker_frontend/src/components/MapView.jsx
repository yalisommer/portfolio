import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Overlay from 'ol/Overlay';
import axios from 'axios';

function MapView() {
  const mapRef = useRef();
  const mapElement = useRef();
  const vectorLayerRef = useRef();
  const [sharkData, setSharkData] = useState({ sharks: [], paths: [] });
  const [selectedShark, setSelectedShark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharkData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/sharks/coordinates');
        setSharkData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shark data:', error);
        setError('Failed to fetch shark data');
        setLoading(false);
      }
    };

    fetchSharkData();
  }, []);

  // Initialize map
  useEffect(() => {
    if (loading || error || mapRef.current) return;

    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
            attributions: '© OpenStreetMap contributors, © CARTO'
          })
        })
      ],
      view: new View({
        center: fromLonLat([-117, 27]),
        zoom: 7,
        minZoom: 4,
        maxZoom: 12
      })
    });

    const vectorSource = new VectorSource();

    // Add shark paths
    sharkData.paths?.forEach(path => {
      const coordinates = path.points.map(point => 
        fromLonLat([point.lng, point.lat])
      );
      
      const pathFeature = new Feature({
        geometry: new LineString(coordinates),
        sharkId: path.sharkId,
        color: path.color,
        type: 'path'
      });

      vectorSource.addFeature(pathFeature);
    });

    // Add shark markers
    sharkData.sharks?.forEach(shark => {
      const marker = new Feature({
        geometry: new Point(fromLonLat([shark.lng, shark.lat])),
        sharkData: shark,
        type: 'shark'
      });

      vectorSource.addFeature(marker);
    });

    // Initial style function
    const initialStyle = (feature) => {
      const type = feature.get('type');
      
      if (type === 'shark') {
        const shark = feature.get('sharkData');
        return new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: shark.color
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2
            })
          })
        });
      } else {
        return new Style({
          stroke: new Stroke({
            color: feature.get('color'),
            width: 2
          })
        });
      }
    };

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: initialStyle
    });

    vectorLayerRef.current = vectorLayer;
    map.addLayer(vectorLayer);

    // Handle click events
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, feature => feature);
      const clickedShark = feature?.get('sharkData');
      
      if (clickedShark) {
        if (selectedShark && clickedShark.id === selectedShark.id) {
          setSelectedShark(null);
        } else {
          setSelectedShark(clickedShark);
        }
      } else {
        setSelectedShark(null);
      }
    });

    mapRef.current = map;
  }, [loading, error, sharkData]);

  // Update styles when selection changes
  useEffect(() => {
    if (!vectorLayerRef.current) return;

    const createStyle = (feature) => {
      const type = feature.get('type');
      
      if (type === 'shark') {
        const shark = feature.get('sharkData');
        const isSelected = selectedShark && shark.id === selectedShark.id;
        const isUnselected = selectedShark && !isSelected;

        return new Style({
          image: new CircleStyle({
            radius: isSelected ? 8 : 6,
            fill: new Fill({
              color: isUnselected ? 'rgba(128, 128, 128, 0.6)' : shark.color
            }),
            stroke: new Stroke({
              color: isUnselected ? 'rgba(160, 160, 160, 0.8)' : '#ffffff',
              width: isSelected ? 3 : 2
            })
          })
        });
      } else {
        const sharkId = feature.get('sharkId');
        const isSelected = selectedShark && sharkId === selectedShark.id;
        const isUnselected = selectedShark && !isSelected;

        return new Style({
          stroke: new Stroke({
            color: isUnselected ? 'rgba(128, 128, 128, 0.4)' : feature.get('color'),
            width: isSelected ? 3 : 2
          })
        });
      }
    };

    vectorLayerRef.current.setStyle(createStyle);
    
    if (mapRef.current) {
      mapRef.current.render();
    }
  }, [selectedShark]);

  // Force plot reload when selected shark changes
  useEffect(() => {
    if (selectedShark) {
      // Create a new image element to force reload
      const img = new Image();
      img.src = `http://localhost:8000/sharks/${selectedShark.id}/plot?force=${Math.random()}`;
    }
  }, [selectedShark]);

  const sortedSharks = [...(sharkData.sharks || [])].sort((a, b) => {
    const aNum = parseInt(a.id.replace('WS', ''));
    const bNum = parseInt(b.id.replace('WS', ''));
    return aNum - bNum;
  });

  // Handle legend item click
  const handleSharkSelect = (shark) => {
    if (selectedShark && selectedShark.id === shark.id) {
      setSelectedShark(null);
    } else {
      setSelectedShark(shark);
    }
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (loading) {
    return <div className="loading">Loading map data...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Map Container */}
      <div style={{ width: '100%', height: '600px', marginBottom: selectedShark ? '20px' : '0' }}>
        <div ref={mapElement} style={{ width: '100%', height: '100%' }} />
        
        {/* Shark Info Panel */}
        <div className="shark-info-panel" style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          color: 'white',
          maxWidth: '300px',
          border: '1px solid rgba(45, 95, 138, 0.3)',
          display: selectedShark ? 'block' : 'none'
        }}>
          {selectedShark && (
            <>
              <h3 style={{ color: '#2d5f8a', marginTop: 0 }}>Shark {parseInt(selectedShark.id.replace('WS', ''))}</h3>
              <div style={{ marginTop: '15px' }}>
                <p><strong>Depth:</strong> {selectedShark.depth}m</p>
                <p><strong>Length:</strong> {selectedShark.length}m</p>
                <p><strong>Location:</strong></p>
                <p>Latitude: {selectedShark.lat.toFixed(4)}°</p>
                <p>Longitude: {selectedShark.lng.toFixed(4)}°</p>
                <p><strong>Last Updated:</strong></p>
                <p>{new Date(selectedShark.timestamp).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedShark(null)}
                style={{
                  marginTop: '15px',
                  padding: '8px 15px',
                  background: '#2d5f8a',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Clear Selection
              </button>
            </>
          )}
        </div>
        
        {/* Legend */}
        <div className="map-legend" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          color: 'white',
          maxHeight: '80%',
          overflowY: 'auto',
          zIndex: 1000,
          border: '1px solid rgba(45, 95, 138, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2d5f8a' }}>Shark Tracking</h3>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>Click on a shark to view details</p>
          {sortedSharks.map(shark => (
            <div 
              key={shark.id} 
              className="legend-item"
              onClick={() => handleSharkSelect(shark)}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '14px',
                opacity: selectedShark ? (selectedShark.id === shark.id ? 1 : 0.5) : 1,
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: selectedShark && selectedShark.id !== shark.id ? 
                  'rgba(128, 128, 128, 0.6)' : shark.color,
                marginRight: '8px',
                border: '2px solid white'
              }} />
              <span>Shark {parseInt(shark.id.replace('WS', ''))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plot Section */}
      {selectedShark && (
        <div style={{
          width: '100%',
          padding: '20px',
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          borderRadius: '8px',
          border: '1px solid rgba(45, 95, 138, 0.3)'
        }}>
          <h2 style={{ color: '#2d5f8a', marginBottom: '20px' }}>
            Movement Track for Shark {parseInt(selectedShark.id.replace('WS', ''))}
          </h2>
          <img
            src={`http://localhost:8000/sharks/${selectedShark.id}/plot?nocache=${Math.random()}`}
            alt={`Movement track for Shark ${parseInt(selectedShark.id.replace('WS', ''))}`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '4px',
              boxShadow: '0 4px 15px rgba(45, 95, 138, 0.2)'
            }}
            onError={(e) => {
              // If image fails to load, try reloading it
              e.target.src = `http://localhost:8000/sharks/${selectedShark.id}/plot?reload=${Math.random()}`;
            }}
          />
        </div>
      )}
    </div>
  );
}

export default MapView;