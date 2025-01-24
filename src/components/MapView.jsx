import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import 'ol/ol.css';

function MapView() {
  const [map, setMap] = useState(null);
  const [sharkLocations, setSharkLocations] = useState([]);

  useEffect(() => {
    // Create map
    const initialMap = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([-118.2615, 29.1148]), // Centered on Guadalupe Island
        zoom: 10
      })
    });

    setMap(initialMap);

    // Fetch shark coordinates
    const fetchSharkLocations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/sharks/coordinates');
        setSharkLocations(response.data);
      } catch (error) {
        console.error('Error fetching shark coordinates:', error);
      }
    };

    fetchSharkLocations();

    return () => {
      if (map) {
        map.setTarget(undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (!map || !sharkLocations.length) return;

    // Create features for shark locations
    const features = sharkLocations.map((shark, index) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([shark.longitude, shark.latitude])),
        name: `Shark ${shark.shark_id}`
      });

      // Create unique color for each shark
      const hue = (index * 36) % 360; // Distribute colors evenly
      feature.setStyle(new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: `hsla(${hue}, 100%, 50%, 0.8)`
          }),
          stroke: new Stroke({
            color: 'white',
            width: 2
          })
        })
      }));

      return feature;
    });

    // Create vector layer for sharks
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: features
      })
    });

    // Remove any existing vector layers
    map.getLayers().getArray()
      .filter(layer => layer instanceof VectorLayer)
      .forEach(layer => map.removeLayer(layer));

    // Add new vector layer
    map.addLayer(vectorLayer);

  }, [map, sharkLocations]);

  return (
    <div id="map" style={{ width: '100%', height: '600px' }}></div>
  );
}

export default MapView;