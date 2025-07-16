import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
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
  const { gl } = useThree();

  return (
    <group
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        gl.domElement.style.cursor = isSelected ? 'grab' : 'pointer';
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
      
      {/* Selection indicator */}
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
      
      {/* Drop shadow for better depth perception */}
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