import React, { useRef, useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Modal, Input, Button, Radio } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const Canvas = ({ imageSrc }) => {
  const canvasRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);

  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);

  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [drawingMode, setDrawingMode] = useState('box');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [label, setLabel] = useState("");

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      let newWidth, newHeight;

      if (imgAspectRatio > canvasAspectRatio) {
        newWidth = CANVAS_WIDTH;
        newHeight = CANVAS_WIDTH / imgAspectRatio;
      } else {
        newHeight = CANVAS_HEIGHT;
        newWidth = CANVAS_HEIGHT * imgAspectRatio;
      }

      const imgScale = newWidth / img.width;
      const x = (CANVAS_WIDTH - newWidth) / 2;
      const y = (CANVAS_HEIGHT - newHeight) / 2;

      setScale(imgScale);
      setXOffset(x);
      setYOffset(y);

      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, x, y, newWidth, newHeight);

      annotations.forEach(({ x1, y1, x2, y2, points, label, type }) => {
        context.beginPath();
        context.globalAlpha = 0.5;
        context.fillStyle = 'rgb(170, 255, 50)';
        context.strokeStyle = 'green';
        if (type === 'box') {
          context.rect(x1 * imgScale + x, y1 * imgScale + y, (x2 - x1) * imgScale, (y2 - y1) * imgScale);
          context.fill();
          context.globalAlpha = 1.0;
          context.font = "16px Arial";
          context.fillStyle = 'black';
          context.fillText(label, x1 * imgScale + x, y1 * imgScale + y - 5);
        } else if (type === 'polygon') {
          context.moveTo(points[0].x * imgScale + x, points[0].y * imgScale + y);
          points.forEach(({ x: px, y: py }) => context.lineTo(px * imgScale + x, py * imgScale + y));
          context.closePath();
          context.fill();
          context.globalAlpha = 1.0;
          context.font = "16px Arial";
          context.fillStyle = 'black';
          context.fillText(label, points[0].x * imgScale + x, points[0].y * imgScale + y - 5);
        }
        context.stroke();
      });
    };
  }, [annotations, imageSrc]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const scaledX = (offsetX - xOffset) / scale;
    const scaledY = (offsetY - yOffset) / scale;
    if (scaledX < 0 || scaledY < 0 || scaledX > (CANVAS_WIDTH - 2 * xOffset) / scale || scaledY > (CANVAS_HEIGHT - 2 * yOffset) / scale) {
      return;
    }
    if (drawingMode === 'box') {
      setCurrentAnnotation({ x1: scaledX, y1: scaledY, x2: scaledX, y2: scaledY });
    } else if (drawingMode === 'polygon') {
      setCurrentPolygon((prev) => [...prev, { x: scaledX, y: scaledY }]);
    }
  };

  const handleMouseMove = (e) => {
    if (!currentAnnotation) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const scaledX = (offsetX - xOffset) / scale;
    const scaledY = (offsetY - yOffset) / scale;
    if (drawingMode === 'box') {
      setCurrentAnnotation((prev) => ({
        ...prev,
        x2: scaledX,
        y2: scaledY,
      }));
    }
  };

  const handleMouseUp = () => {
    if (drawingMode === 'box' && currentAnnotation) {
      setIsModalVisible(true);
    }
  };

  const handlePolygonComplete = () => {
    if (drawingMode === 'polygon' && currentPolygon.length > 2) {
      setIsModalVisible(true);
    }
  };
  
  const handleAddLabel = () => {
    if (drawingMode === 'box') {
      setAnnotations([...annotations, { ...currentAnnotation, label, type: 'box' }]);
    } else if (drawingMode === 'polygon') {
      setAnnotations([...annotations, { points: currentPolygon, label, type: 'polygon' }]);
      setCurrentPolygon([]);
    }
    setCurrentAnnotation(null);
    setLabel("");
    setIsModalVisible(false);
  };

  useEffect(() => {
    setAnnotations([]);
    setDrawingMode('box');
  }, [imageSrc]);

  const exportZip = async () => {
    const zip = new JSZip();
    const canvas = canvasRef.current;
    const labelBlob = await new Promise(resolve => canvas.toBlob(resolve));
    zip.file('label.png', labelBlob);

    const annotationsWithId = annotations.map((annotation, index) => ({
      id: annotation.id || index,
      ...annotation,
    }));

    const jsonContent = JSON.stringify(annotationsWithId, null, 2);
    zip.file('annotations.json', jsonContent);

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
    <div>
      <div>
        <Radio.Group
          onChange={(e) => setDrawingMode(e.target.value)}
          value={drawingMode}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="box">Box</Radio.Button>
          <Radio.Button value="polygon">Polygon</Radio.Button>
        </Radio.Group>
      </div>

      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            border: '1px solid #000',
            maxWidth: '100%',
            height: 'auto',
            cursor: drawingMode === 'box' || drawingMode === 'polygon' ? 'crosshair' : 'auto',
          }}
        />

        {drawingMode === 'box' && currentAnnotation && (
          <svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <rect
              x={currentAnnotation.x1 * scale + xOffset}
              y={currentAnnotation.y1 * scale + yOffset}
              width={(currentAnnotation.x2 - currentAnnotation.x1) * scale}
              height={(currentAnnotation.y2 - currentAnnotation.y1) * scale}
              fill="transparent"
              stroke="green"
              strokeWidth="2"
            />
          </svg>
        )}

        {drawingMode === 'polygon' && currentPolygon.length > 0 && (
          <svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <polygon
              points={currentPolygon.map(p => `${p.x * scale + xOffset},${p.y * scale + yOffset}`).join(' ')}
              fill="transparent"
              stroke="green"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {drawingMode === 'polygon' && currentPolygon.length > 0 && (
        <Button onClick={handlePolygonComplete} style={{ marginTop: 16 }}>
          Complete Polygon
        </Button>
      )}

      <Modal
        title="Add Label"
        open={isModalVisible}
        onOk={handleAddLabel}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter label"
        />
      </Modal>

      <div>
        <Button onClick={exportZip} icon={<DownloadOutlined />} style={{ marginTop: 16 }}>
          Download ZIP
        </Button>
      </div>
    </div>
  );
};

export default Canvas;
