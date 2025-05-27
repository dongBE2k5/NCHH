import { useState, useRef, useEffect } from 'react';
function DynamicGrid({
  id,
  rows = 1,
  columns = 1,
  nestedConfig = {},
  columnRatios = [],
  onUpdate,
  initialValue,
}) {
  const [cellValues, setCellValues] = useState({});

  useEffect(() => {
    if (initialValue && typeof initialValue === 'object') {
      setCellValues(initialValue);
    }
  }, [initialValue]);

  const parseRatios = (input) => {
    if (Array.isArray(input)) return input.map(n => `${n}fr`);
    if (typeof input === 'string') return input.trim().split(/\s+/).map(n => `${n}fr`);
    return [];
  };

  const parsedRatios = parseRatios(columnRatios);
  const gridTemplateColumns = parsedRatios.length === columns && parsedRatios.length > 0
    ? parsedRatios.join(' ')
    : `repeat(${columns}, 1fr)`;

  const parseNested = (configStr) => {
    const nums = configStr.trim().split(/\s+/).map(Number);
    return { innerRows: 1, innerColumns: nums.length, innerRatios: nums };
  };

  const EditableCell = ({ index, defaultText }) => {
    const divRef = useRef(null);

    const autoResize = () => {
      const el = divRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    };

    useEffect(() => {
      const el = divRef.current;
      if (el && !el.textContent) {
        el.textContent = cellValues[index] || defaultText;

      }
      autoResize();
    }, [index, cellValues, defaultText]);

    const handleInput = () => {
      const data = divRef.current.textContent;
      setCellValues(prev => {
        const updatedValues = { ...prev, [index]: data };
        if (onUpdate) {
          onUpdate(id, { data: updatedValues }); // Gửi data lên parent
        }
        return updatedValues;
      });
    };

    return (
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          minHeight: '24px',
          padding: '4px',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
        }}
        onInput={autoResize}
        onBlur={handleInput}
      />
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns, gap: '8px' }}>
      {Array.from({ length: rows * columns }).map((_, index) => {
        const configStr = nestedConfig[index];
        const nested = configStr ? parseNested(configStr) : null;
        return (
          <div key={index} style={{ border: '1px solid #ccc', padding: '0px' }}>
            {nested ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: parseRatios(nested.innerRatios).join(' '),
                  gap: '4px',
                }}
              >
                {nested.innerRatios.map((_, innerIndex) => (
                  <EditableCell
                    key={innerIndex}
                    index={`${index}.${innerIndex}`}
                    defaultText={cellValues[`${index}.${innerIndex}`] || `${index + 1}.${innerIndex + 1}`}
                  />
                ))}
              </div>
            ) : (
              <EditableCell
                index={index.toString()}
                defaultText={cellValues[index.toString()] || `${index + 1}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DynamicGrid;