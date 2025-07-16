import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState, useRef } from 'react';
import { FloatingToolbar } from './FloatingToolbar';
import { SelectionPanel } from './SelectionPanel';
import { SceneObjects } from './SceneObjects';
import { LoadingScene } from './LoadingScene';

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
  const [objects, setObjects] = useState<SceneObject[]>([
    // Demo objects to showcase the environment
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
  ]);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isEventMode, setIsEventMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setObjects(prev => [...prev, newObject]);
    setSelectedObject(newObject);
  };

  const addDemoObject = () => {
    const objectNames = ['Decoration', 'Stand', 'Display', 'Element', 'Piece'];
    const randomName = objectNames[Math.floor(Math.random() * objectNames.length)];
    addObject(null, `${randomName} ${objects.length + 1}`);
  };

  const updateObject = (id: string, updates: Partial<SceneObject>) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
    if (selectedObject?.id === id) {
      setSelectedObject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteObject = (id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
    if (selectedObject?.id === id) {
      setSelectedObject(null);
    }
  };

  const duplicateObject = (id: string) => {
    const original = objects.find(obj => obj.id === id);
    if (!original) return;

    const newObject: SceneObject = {
      ...original,
      id: crypto.randomUUID(),
      position: [original.position[0] + 2, original.position[1], original.position[2]]
    };
    setObjects(prev => [...prev, newObject]);
  };

  const resetView = () => {
    // This will be handled by the camera controls
  };

  const clearScene = () => {
    setObjects([]);
    setSelectedObject(null);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // For now, add a demo object since GLTF loading requires more setup
            addDemoObject();
            console.log('Loading file:', file.name);
          }
        }}
        className="hidden"
      />

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

          {selectedObject && (
            <SelectionPanel
              object={selectedObject}
              onUpdate={(updates) => updateObject(selectedObject.id, updates)}
              onDuplicate={() => duplicateObject(selectedObject.id)}
              onDelete={() => deleteObject(selectedObject.id)}
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
    </div>
  );
};