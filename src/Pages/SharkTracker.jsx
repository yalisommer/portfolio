import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

function SharkTracker() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [sharkData, setSharkData] = useState({ sharks: [], paths: [] });
  const [selectedShark, setSelectedShark] = useState(null);

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

  useEffect(() => {
    if (!loading && !error && !map) {
      const mapInstance = new Map({
        target: 'map',
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
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
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
          }
          return null;
        }
      });

      sharkData.sharks?.forEach(shark => {
        const marker = new Feature({
          geometry: new Point(fromLonLat([shark.lng, shark.lat])),
          sharkData: shark,
          type: 'shark'
        });
        vectorSource.addFeature(marker);
      });

      mapInstance.addLayer(vectorLayer);
      setMap(mapInstance);
    }
  }, [loading, error, sharkData, map]);

  if (loading) return <div className="loading">Loading map data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Shark Tracker</h1>
      <p>Welcome to Yali's Great White Shark Tracker Display. Shark Data provided by the SEANOE White Shark database. Sharks captured off the coast of Guadalupe Island.</p>
      <div id="map" style={{ width: '100%', height: '600px', marginBottom: '2rem' }}></div>
    </div>
  );
}

export default SharkTracker;