import { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { SceneObject } from './ThreePlayground';
import * as THREE from 'three';

interface SceneObjectsProps {
  objects: SceneObject[];
  selectedObject: SceneObject | null;
  onSelectObject: (object: SceneObject | null) => void;
  onUpdateObject: (id: string, updates: Partial<SceneObject>) => void;
  snapToGrid: boolean;
}

const ObjectMesh = ({ 
  object, 
  isSelected, 
  onSelect, 
  onUpdate, 
  snapToGrid 
}: {
  object: SceneObject;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SceneObject>) => void;
  snapToGrid: boolean;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { gl, camera, raycaster, pointer } = useThree();

  const snapToGridFn = (pos: [number, number, number]): [number, number, number] => {
    if (!snapToGrid) return pos;
    const gridSize = 0.25;
    return [
      Math.round(pos[0] / gridSize) * gridSize,
      0, // Always snap to floor
      Math.round(pos[2] / gridSize) * gridSize
    ];
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();
    
    // Create plane at y=0 for dragging
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, intersection);
    
    if (intersection) {
      const newPos = snapToGridFn([intersection.x, 0, intersection.z]);
      onUpdate({ position: newPos });
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    setIsDragging(false);
    gl.domElement.style.cursor = isSelected ? 'grab' : 'pointer';
  };

  return (
    <group
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={isSelected ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        gl.domElement.style.cursor = isDragging ? 'grabbing' : (isSelected ? 'grab' : 'pointer');
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        gl.domElement.style.cursor = 'default';
      }}
    >
      {/* Main object mesh */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={object.color || '#ffffff'}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Hover indicator */}
      {hovered && !isSelected && (
        <mesh>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial 
            color="#4ecdc4" 
            wireframe 
            transparent 
            opacity={0.4}
          />
        </mesh>
      )}
      
      {/* Selection indicator with glow */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial 
            color="#ff6b6b" 
            wireframe 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Drop shadow */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

export const SceneObjects = ({
  objects,
  selectedObject,
  onSelectObject,
  onUpdateObject,
  snapToGrid
}: SceneObjectsProps) => {
  // Click on empty space to deselect
  const handleBackgroundClick = () => {
    onSelectObject(null);
  };

  return (
    <group onClick={handleBackgroundClick}>
      {objects.map((object) => (
        <ObjectMesh
          key={object.id}
          object={object}
          isSelected={selectedObject?.id === object.id}
          onSelect={() => onSelectObject(object)}
          onUpdate={(updates) => onUpdateObject(object.id, updates)}
          snapToGrid={snapToGrid}
        />
      ))}
    </group>
  );
};