import { useDrag } from 'react-dnd';

export default function DraggableItem({ type }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BOX',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 m-2 bg-blue-300 cursor-move rounded ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {type}
    </div>
  );
}
