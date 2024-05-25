import React, { useRef, useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const Canvas = ({ imageSrc }) => {

  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [scale, setScale] = useState(1);


  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      setScale(canvas.clientWidth / canvas.width);
    };
  }, [imageSrc]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(offsetX / scale, offsetY / scale);
    setDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    context.lineTo(offsetX / scale, offsetY / scale);
    context.stroke();
  };

  const endDrawing = () => {
    const context = canvasRef.current.getContext('2d');
    context.closePath();
    setDrawing(false);
  };

  const exportLabel = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'label.png';
    link.click();
  };

  const exportZip = async () => {
    const zip = new JSZip();
    const canvas = canvasRef.current;
    const labelBlob = await new Promise(resolve => canvas.toBlob(resolve));
    zip.file('label.png', labelBlob);

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const imgCanvas = document.createElement('canvas');
      imgCanvas.width = img.width;
      imgCanvas.height = img.height;
      imgCanvas.getContext('2d').drawImage(img, 0, 0);
      imgCanvas.toBlob(blob => {
        zip.file('image.png', blob);
        zip.generateAsync({ type: 'blob' }).then(content => {
          saveAs(content, 'labeled_images.zip');
        });
      });
    };
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onMouseMove={draw}
        style={{
          border: '1px solid #000',
          maxWidth: '100%',
          height: 'auto',
          cursor: 'crosshair'
        }}     
      />
      <button onClick={exportLabel}>Export Label</button>
      <button onClick={exportZip}>Download Zip</button>
    </div>


    
  );
};

export default Canvas;
