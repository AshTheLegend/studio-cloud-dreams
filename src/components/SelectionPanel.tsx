import { useState } from 'react';
import { Copy, Trash2, Palette, Move3D, RotateCw } from 'lucide-react';
import { SceneObject } from './ThreePlayground';

interface SelectionPanelProps {
  object: SceneObject;
  onUpdate: (updates: Partial<SceneObject>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const SelectionPanel = ({
  object,
  onUpdate,
  onDuplicate,
  onDelete
}: SelectionPanelProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newScale = [...object.scale] as [number, number, number];
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    newScale[axisIndex] = value;
    onUpdate({ scale: newScale });
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = [...object.rotation] as [number, number, number];
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    newRotation[axisIndex] = (value * Math.PI) / 180; // Convert to radians
    onUpdate({ rotation: newRotation });
  };

  return (
    <div className="fixed top-6 left-6 floating-panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {object.name}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onDuplicate}
            className="glass-button p-2 text-foreground hover:text-primary"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="glass-button p-2 text-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Color</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded-lg border-2 border-white/30"
            style={{ backgroundColor: object.color || '#ffffff' }}
          />
          {showColorPicker && (
            <div className="flex gap-1">
              {['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'].map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-white/30"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scale Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Move3D className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Scale</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {(['x', 'y', 'z'] as const).map((axis, index) => (
            <div key={axis} className="space-y-1">
              <label className="text-muted-foreground uppercase">{axis}</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={object.scale[index]}
                onChange={(e) => handleScaleChange(axis, parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none slider"
              />
              <span className="text-muted-foreground">{object.scale[index].toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rotation Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Rotation</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {(['x', 'y', 'z'] as const).map((axis, index) => (
            <div key={axis} className="space-y-1">
              <label className="text-muted-foreground uppercase">{axis}</label>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={(object.rotation[index] * 180) / Math.PI}
                onChange={(e) => handleRotationChange(axis, parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none slider"
              />
              <span className="text-muted-foreground">
                {Math.round((object.rotation[index] * 180) / Math.PI)}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};