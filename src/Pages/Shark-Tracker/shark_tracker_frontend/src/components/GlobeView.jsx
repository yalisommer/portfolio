import { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import axios from 'axios';

function GlobeView() {
  const [sharkData, setSharkData] = useState({ sharks: [], paths: [] });
  const [loading, setLoading] = useState(true);
  const globeRef = useRef();

  useEffect(() => {
    const fetchSharkData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/sharks/coordinates');
        console.log('Received shark data:', response.data);
        setSharkData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shark data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        setLoading(false);
      }
    };

    fetchSharkData();
  }, []);

  useEffect(() => {
    // Set initial camera position and controls
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      const camera = globeRef.current.camera();
      
      // Focus on Southern California/Mexico coast region
      const targetLat = 25; // Approximate center latitude
      const targetLng = -115; // Approximate center longitude
      
      // Position camera closer to the region
      camera.position.set(-200, 200, 200);
      
      // Disable auto-rotation for focused view
      controls.autoRotate = false;
      
      // Set tighter control limits
      controls.minDistance = 150;
      controls.maxDistance = 250;
      controls.enablePan = true;
      
      // Limit camera movement
      controls.minAzimuthAngle = -Math.PI/4; // Limit horizontal rotation
      controls.maxAzimuthAngle = Math.PI/4;
      controls.minPolarAngle = Math.PI/4; // Limit vertical rotation
      controls.maxPolarAngle = Math.PI/2;
      
      // Set initial view to target region
      globeRef.current.pointOfView({
        lat: targetLat,
        lng: targetLng,
        altitude: 1.5
      });
    }
  }, []);

  // Prepare path data for visualization
  const pathsData = useMemo(() => {
    return sharkData.paths?.map(path => ({
      ...path,
      coordinates: path.points.map(point => [point.lng, point.lat]),
      colors: path.points.map(point => `rgba(${hexToRgb(path.color)},${point.opacity})`),
    })) || [];
  }, [sharkData.paths]);

  if (loading) {
    return <div className="loading">Loading globe data...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '800px' }}>
      <div className="globe-container" style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0c0c0c'
      }}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          width={800}
          height={800}
          showGraticules={true}
          showAtmosphere={false}
          animateIn={false}
          // Shark position markers
          pointsData={sharkData.sharks}
          pointColor={d => d.color}
          pointAltitude={0.02}
          pointRadius={0.1}
          pointLabel={d => `Shark ${d.id}\nDepth: ${d.depth}m\nLength: ${d.length}m`}
          pointResolution={8}
          pointsMerge={false}
          pointsTransitionDuration={0}
          pointGlow={true}
          pointAltitudeScale={0.1}
          onPointClick={(point) => {
            console.log('Clicked shark:', point);
            alert(`Shark ${point.id}\nDepth: ${point.depth}m\nLength: ${point.length}m`);
          }}
          // Shark movement paths
          pathsData={pathsData}
          pathPoints="coordinates"
          pathPointLat={p => p[1]}
          pathPointLng={p => p[0]}
          pathColor={path => path.colors}
          pathStroke={0.5}
          pathDashLength={0.3}
          pathDashGap={0.001}
          pathDashAnimateTime={5000}
          pathResolution={2}
        />
      </div>
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(12, 12, 12, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid rgba(70, 198, 179, 0.3)',
        color: 'white',
        maxHeight: '80%',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#46c6b3' }}>Shark Tracking</h3>
        {sharkData.sharks.map(shark => (
          <div key={shark.id} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: shark.color,
              marginRight: '8px'
            }} />
            <span>Shark {shark.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r},${g},${b}`;
}

export default GlobeView;