import React from 'react';

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <img 
        src="/Shark-Image.png" 
        alt="Loading..." 
        className="loading-shark"
        style={{
          width: '100px',
          height: '100px',
          objectFit: 'contain'
        }}
      />
      <p>Loading map data...</p>
    </div>
  );
}

export default LoadingSpinner;