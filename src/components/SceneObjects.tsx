import { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { SceneObject } from './ThreePlayground';
import * as THREE from 'three';
import { useDrag } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/three';

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
  const { gl, camera } = useThree();

  const snapToGridFn = (pos: [number, number, number]): [number, number, number] => {
    if (!snapToGrid) return pos;
    const gridSize = 0.25;
    return [
      Math.round(pos[0] / gridSize) * gridSize,
      0, // Always snap to floor
      Math.round(pos[2] / gridSize) * gridSize
    ];
  };

  const [{ position, scale }, api] = useSpring(() => ({
    position: object.position,
    scale: isSelected ? [1.05, 1.05, 1.05] : [1, 1, 1],
    config: { tension: 280, friction: 20 }
  }));

  const bind = useDrag(
    ({ active, movement: [x, y], memo = object.position }) => {
      if (active) {
        setIsDragging(true);
        // Convert screen movement to world movement
        const factor = camera.position.z * 0.01;
        const newPos: [number, number, number] = [
          memo[0] + x * factor,
          0,
          memo[2] - y * factor
        ];
        api.start({ position: newPos });
      } else {
        setIsDragging(false);
        // Snap to grid on release
        const snappedPos = snapToGridFn([position.get()[0], 0, position.get()[2]]);
        onUpdate({ position: snappedPos });
        api.start({ position: snappedPos });
      }
      return memo;
    }
  );

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