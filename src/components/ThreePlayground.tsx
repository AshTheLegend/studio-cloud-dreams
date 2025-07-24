import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState, useRef } from 'react';
import { FloatingToolbar } from './FloatingToolbar';
import { SelectionPanel } from './SelectionPanel';
import { SceneObjects } from './SceneObjects';
import { LoadingScene } from './LoadingScene';
import { ModelImporter } from './ModelImporter';
import { PatternDuplicator } from './PatternDuplicator';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { toast } from '@/hooks/use-toast';

export interface SceneObject {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  model?: any;
  name: string;
}

export const ThreePlayground = () => {
  const initialObjects: SceneObject[] = [
    {
      id: 'demo-1',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      name: 'Center Cube',
      color: '#ff6b6b'
    },
    {
      id: 'demo-2',
      position: [3, 0.5, 2],
      rotation: [0, Math.PI / 4, 0],
      scale: [1.2, 0.8, 1.2],
      name: 'Display Stand',
      color: '#4ecdc4'
    },
    {
      id: 'demo-3',
      position: [-2, 0.5, -1],
      rotation: [0, -Math.PI / 6, 0],
      scale: [0.8, 1.5, 0.8],
      name: 'Decoration',
      color: '#45b7d1'
    }
  ];

  const { state: objects, setState: setObjectsWithHistory, undo, redo, canUndo, canRedo } = useUndoRedo(initialObjects);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isEventMode, setIsEventMode] = useState(false);
  const [showPatternDuplicator, setShowPatternDuplicator] = useState(false);
  const cameraRef = useRef<any>(null);

  const addObject = (model: any, name: string) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newObject: SceneObject = {
      id: crypto.randomUUID(),
      position: [Math.random() * 6 - 3, 0.5, Math.random() * 6 - 3],
      rotation: [0, Math.random() * Math.PI * 2, 0],
      scale: [1, 1, 1],
      model,
      name,
      color: randomColor
    };
    const newObjects = [...objects, newObject];
    setObjectsWithHistory(newObjects);
    setSelectedObject(newObject);
    toast({ title: "Object Added", description: `${name} has been added to the scene` });
  };

  const addDemoObject = () => {
    const objectNames = ['Decoration', 'Stand', 'Display', 'Element', 'Piece'];
    const randomName = objectNames[Math.floor(Math.random() * objectNames.length)];
    addObject(null, `${randomName} ${objects.length + 1}`);
  };

  const updateObject = (id: string, updates: Partial<SceneObject>) => {
    const newObjects = objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    );
    setObjectsWithHistory(newObjects);
    if (selectedObject?.id === id) {
      setSelectedObject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteObject = (id: string) => {
    const newObjects = objects.filter(obj => obj.id !== id);
    setObjectsWithHistory(newObjects);
    if (selectedObject?.id === id) {
      setSelectedObject(null);
    }
    toast({ title: "Object Deleted", description: "Object has been removed from the scene" });
  };

  const duplicateObject = (id: string) => {
    const original = objects.find(obj => obj.id === id);
    if (!original) return;

    const newObject: SceneObject = {
      ...original,
      id: crypto.randomUUID(),
      position: [original.position[0] + 2, original.position[1], original.position[2]]
    };
    const newObjects = [...objects, newObject];
    setObjectsWithHistory(newObjects);
    setSelectedObject(newObject);
    toast({ title: "Object Duplicated", description: `${original.name} has been duplicated` });
  };

  const createPattern = (rows: number, cols: number, xGap: number, zGap: number) => {
    if (!selectedObject) return;
    
    const newObjects = [...objects];
    const basePos = selectedObject.position;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (row === 0 && col === 0) continue; // Skip original position
        
        const newObject: SceneObject = {
          ...selectedObject,
          id: crypto.randomUUID(),
          position: [
            basePos[0] + col * xGap,
            basePos[1],
            basePos[2] + row * zGap
          ]
        };
        newObjects.push(newObject);
      }
    }
    
    setObjectsWithHistory(newObjects);
    setShowPatternDuplicator(false);
    toast({ title: "Pattern Created", description: `${rows}x${cols} pattern with ${newObjects.length - objects.length} new objects` });
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(10, 10, 10);
      cameraRef.current.lookAt(0, 0, 0);
    }
    toast({ title: "View Reset", description: "Camera view has been reset to default" });
  };

  const clearScene = () => {
    setObjectsWithHistory([]);
    setSelectedObject(null);
    toast({ title: "Scene Cleared", description: "All objects have been removed from the scene" });
  };

  const exportScene = () => {
    // TODO: Implement GLB export
    toast({ title: "Export", description: "Scene export feature coming soon!" });
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        
        {/* Lighting setup for studio quality */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.5} />

        {/* Environment for reflections */}
        <Environment preset="studio" />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
          dampingFactor={0.05}
          enableDamping
        />

        {/* Scene content */}
        <Suspense fallback={<LoadingScene />}>
          {/* Infinite floor with grid */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="white" roughness={0.1} metalness={0.1} />
          </mesh>

          {/* Grid overlay */}
          {showGrid && (
            <Grid
              args={[100, 100]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#e0e0e0"
              sectionSize={10}
              sectionThickness={1}
              sectionColor="#c0c0c0"
              fadeDistance={50}
              fadeStrength={1}
              infiniteGrid
              followCamera={false}
            />
          )}

          {/* Scene objects */}
          <SceneObjects
            objects={objects}
            selectedObject={selectedObject}
            onSelectObject={setSelectedObject}
            onUpdateObject={updateObject}
            snapToGrid={snapToGrid}
          />
        </Suspense>
      </Canvas>

      {/* UI Layer - only show if not in event mode */}
      {!isEventMode && (
        <>
          {/* Model Importer */}
          <ModelImporter onImportModel={addObject} />

          {/* Enhanced Floating Toolbar */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
            <FloatingToolbar
              onImport={addDemoObject}
              onDuplicate={() => selectedObject && duplicateObject(selectedObject.id)}
              onDelete={() => selectedObject && deleteObject(selectedObject.id)}
              onToggleGrid={() => setShowGrid(!showGrid)}
              onToggleSnap={() => setSnapToGrid(!snapToGrid)}
              onResetView={resetView}
              onClearScene={clearScene}
              showGrid={showGrid}
              snapToGrid={snapToGrid}
              hasSelection={!!selectedObject}
            />
            
            {/* Undo/Redo Controls */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 flex space-x-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-white/10 rounded"
              >
                Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-white/10 rounded"
              >
                Redo
              </button>
            </div>
          </div>

          {/* Enhanced Selection Panel */}
          {selectedObject && (
            <div className="fixed left-6 bottom-6 space-y-3">
              <SelectionPanel
                object={selectedObject}
                onUpdate={(updates) => updateObject(selectedObject.id, updates)}
                onDuplicate={() => duplicateObject(selectedObject.id)}
                onDelete={() => deleteObject(selectedObject.id)}
              />
              
              {/* Pattern Duplication Button */}
              <button
                onClick={() => setShowPatternDuplicator(true)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 text-white hover:bg-white/20 transition-all"
              >
                Create Pattern
              </button>
            </div>
          )}

          {/* Pattern Duplicator Modal */}
          {showPatternDuplicator && (
            <PatternDuplicator
              onPatternCreate={createPattern}
              onCancel={() => setShowPatternDuplicator(false)}
            />
          )}
        </>
      )}

      {/* Event mode toggle */}
      <button
        onClick={() => setIsEventMode(!isEventMode)}
        className="fixed top-6 right-6 glass-button px-4 py-2 text-sm font-medium text-foreground"
      >
        {isEventMode ? 'Exit Event Mode' : 'Event Mode'}
      </button>

      {/* Export button */}
      {!isEventMode && (
        <button
          onClick={exportScene}
          className="fixed top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-all"
        >
          Export Scene
        </button>
      )}
    </div>
  );
};