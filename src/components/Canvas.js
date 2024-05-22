import React from 'react';

const Canvas = ({ imageSrc }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={imageSrc} alt="Uploaded" style={{ maxWidth: '100%' }} />
    </div>
  );
};

export default Canvas;
