import { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
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

  const snapToGridFn = (pos: [number, number, number]): [number, number, number] => {
    if (!snapToGrid) return pos;
    const gridSize = 0.25;
    return [
      Math.round(pos[0] / gridSize) * gridSize,
      0, // Always snap to floor
      Math.round(pos[2] / gridSize) * gridSize
    ];
  };

  const handleTransformChange = () => {
    if (meshRef.current) {
      const position = meshRef.current.position;
      const snappedPos = snapToGridFn([position.x, 0, position.z]);
      onUpdate({ 
        position: snappedPos,
        rotation: [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z],
        scale: [meshRef.current.scale.x, meshRef.current.scale.y, meshRef.current.scale.z]
      });
    }
  };

  return (
    <>
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
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
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

      {/* Transform Controls - 3D Gizmo */}
      {isSelected && (
        <TransformControls
          object={meshRef}
          mode="translate"
          size={0.8}
          showX={true}
          showY={false} // Lock Y axis - objects stay on floor
          showZ={true}
          space="world"
          onObjectChange={handleTransformChange}
        />
      )}
    </>
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