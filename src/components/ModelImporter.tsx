import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, RotateCcw } from 'lucide-react';

interface ModelImporterProps {
  onImportModel: (model: any, name: string) => void;
}

interface ImportedModel {
  name: string;
  url: string;
}

export const ModelImporter = ({ onImportModel }: ModelImporterProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentModels, setRecentModels] = useState<ImportedModel[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      const url = URL.createObjectURL(file);
      const fileName = file.name.replace(/\.(glb|gltf)$/i, '');
      
      // Add to recent models
      const newModel: ImportedModel = {
        name: fileName,
        url: url
      };
      setRecentModels(prev => [newModel, ...prev.slice(0, 4)]); // Keep last 5
      
      // For now, just add a demo object - we'll implement proper loading next
      onImportModel(null, fileName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      const url = URL.createObjectURL(file);
      const fileName = file.name.replace(/\.(glb|gltf)$/i, '');
      
      const newModel: ImportedModel = {
        name: fileName,
        url: url
      };
      setRecentModels(prev => [newModel, ...prev.slice(0, 4)]);
      
      onImportModel(null, fileName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const reAddModel = (model: ImportedModel) => {
    onImportModel(null, model.name);
  };

  return (
    <Card className="fixed top-4 right-4 p-4 bg-white/10 backdrop-blur-md border-white/20 z-50">
      <div className="space-y-3">
        {/* Main Import */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
            dragOver 
              ? 'border-primary bg-primary/10' 
              : 'border-white/30 hover:border-white/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto mb-2 h-6 w-6 text-white/70" />
          <p className="text-sm text-white/70 mb-2">
            Drop .glb/.gltf files here
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Recent Models */}
        {recentModels.length > 0 && (
          <div>
            <p className="text-xs text-white/60 mb-2">Recently Imported:</p>
            <div className="space-y-1">
              {recentModels.map((model, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => reAddModel(model)}
                  className="w-full justify-start text-xs text-white/70 hover:bg-white/10"
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  {model.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};