import React, { useRef, useState } from 'react';
import { Stage, Layer, Image, Text } from 'react-konva';
import '../assets/scss/DropAndDrop.scss';

function DropAndDrop() {
  const [items, setItems] = useState([]);
  const stageRef = useRef(null);

  // Xử lý kéo thả hình ảnh
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', e.target.src);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    const imageUrl = e.dataTransfer.getData('text/plain');
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setItems([...items, {
        type: 'image',
        x: e.layerX - 50,
        y: e.layerY - 50,
        width: 100,
        height: 100,
        src: imageUrl,
        id: Date.now()
      }]);
    };
  };

  // Thêm văn bản
  const addText = () => {
    setItems([...items, {
      type: 'text',
      x: 50,
      y: 50,
      text: 'Văn bản mẫu',
      fontSize: 20,
      fill: 'black',
      id: Date.now()
    }]);
  };

  // Cập nhật vị trí item khi kéo
  const updateItemPosition = (id, newAttrs) => {
    setItems(items.map(item => item.id === id ? { ...item, ...newAttrs } : item));
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h3>Thêm Item</h3>
        <img
          src="https://via.placeholder.com/100"
          alt="Hình mẫu"
          className="draggable-item"
          draggable
          onDragStart={handleDragStart}
        />
        <button onClick={addText}>Thêm Văn Bản</button>
      </div>
      <div
        className="canvas-container"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Stage width={600} height={400} ref={stageRef}>
          <Layer>
            {items.map(item => {
              if (item.type === 'image') {
                return (
                  <Image
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    image={(() => {
                      const img = new window.Image();
                      img.src = item.src;
                      return img;
                    })()}
                    draggable
                    onDragEnd={(e) => {
                      updateItemPosition(item.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                  />
                );
              } else if (item.type === 'text') {
                return (
                  <Text
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    text={item.text}
                    fontSize={item.fontSize}
                    fill={item.fill}
                    draggable
                    onDragEnd={(e) => {
                      updateItemPosition(item.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default DropAndDrop;