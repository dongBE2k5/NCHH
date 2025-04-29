import { useDrop } from 'react-dnd';
import { useState } from 'react';

export default function DropArea() {
  const [components, setComponents] = useState([]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BOX',
    drop: (item) => {
      setComponents((prev) => [...prev, item.type]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`w-full h-[400px] p-4 border-4 border-dashed rounded ${
        isOver ? 'border-green-400 bg-green-50' : 'border-gray-300'
      }`}
    >
      <h2 className="text-lg font-bold mb-2">Drop Here</h2>
      {components.map((type, index) => (
        <div key={index} className="mb-2">
          {type === 'Input' && <input type="text" placeholder="New Input" className="border p-2 w-full" />}
        </div>
      ))}
    </div>
  );
}
