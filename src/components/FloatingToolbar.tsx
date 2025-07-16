import { Upload, Copy, Trash2, Grid3X3, Magnet, RotateCcw, SquareX } from 'lucide-react';

interface FloatingToolbarProps {
  onImport: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onResetView: () => void;
  onClearScene: () => void;
  showGrid: boolean;
  snapToGrid: boolean;
  hasSelection: boolean;
}

export const FloatingToolbar = ({
  onImport,
  onDuplicate,
  onDelete,
  onToggleGrid,
  onToggleSnap,
  onResetView,
  onClearScene,
  showGrid,
  snapToGrid,
  hasSelection
}: FloatingToolbarProps) => {
  return (
    <div className="floating-toolbar">
      <button
        onClick={onImport}
        className="glass-button p-3 text-foreground hover:text-primary glow-effect"
        title="Add New Object"
      >
        <Upload className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-white/20" />

      <button
        onClick={onDuplicate}
        disabled={!hasSelection}
        className="glass-button p-3 text-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        title="Duplicate Selected"
      >
        <Copy className="w-5 h-5" />
      </button>

      <button
        onClick={onDelete}
        disabled={!hasSelection}
        className="glass-button p-3 text-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete Selected"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-white/20" />

      <button
        onClick={onToggleGrid}
        className={`glass-button p-3 ${showGrid ? 'text-primary' : 'text-foreground'} hover:text-primary`}
        title="Toggle Grid"
      >
        <Grid3X3 className="w-5 h-5" />
      </button>

      <button
        onClick={onToggleSnap}
        className={`glass-button p-3 ${snapToGrid ? 'text-primary' : 'text-foreground'} hover:text-primary`}
        title="Toggle Snap to Grid"
      >
        <Magnet className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-white/20" />

      <button
        onClick={onResetView}
        className="glass-button p-3 text-foreground hover:text-primary"
        title="Reset View"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      <button
        onClick={onClearScene}
        className="glass-button p-3 text-foreground hover:text-destructive"
        title="Clear Scene"
      >
        <SquareX className="w-5 h-5" />
      </button>
    </div>
  );
};