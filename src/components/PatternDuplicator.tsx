import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Grid, Check, X } from 'lucide-react';

interface PatternDuplicatorProps {
  onPatternCreate: (rows: number, cols: number, xGap: number, zGap: number) => void;
  onCancel: () => void;
}

export const PatternDuplicator = ({ onPatternCreate, onCancel }: PatternDuplicatorProps) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [xGap, setXGap] = useState(2);
  const [zGap, setZGap] = useState(2);

  const handleCreate = () => {
    onPatternCreate(rows, cols, xGap, zGap);
  };

  return (
    <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white/10 backdrop-blur-md border-white/20 z-50 min-w-[300px]">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Grid className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Pattern Duplication</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rows" className="text-white/80">Rows</Label>
            <Input
              id="rows"
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cols" className="text-white/80">Columns</Label>
            <Input
              id="cols"
              type="number"
              min="1"
              max="20"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="xGap" className="text-white/80">X Gap</Label>
            <Input
              id="xGap"
              type="number"
              min="0.5"
              max="10"
              step="0.25"
              value={xGap}
              onChange={(e) => setXGap(parseFloat(e.target.value) || 0.5)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zGap" className="text-white/80">Z Gap</Label>
            <Input
              id="zGap"
              type="number"
              min="0.5"
              max="10"
              step="0.25"
              value={zGap}
              onChange={(e) => setZGap(parseFloat(e.target.value) || 0.5)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
        
        <div className="text-sm text-white/60 text-center">
          {rows * cols} objects will be created
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={handleCreate}
            className="flex-1 bg-primary hover:bg-primary/80"
          >
            <Check className="mr-2 h-4 w-4" />
            Create Pattern
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};