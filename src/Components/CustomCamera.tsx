import { PerspectiveCamera } from "@react-three/drei";
import Editable from "../Theatre/Editable";
import { useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";

const CustomCamera = () => {
  const cameraGroupRef = useRef<THREE.Group | null>(null);
  useFrame((state) => {
    const { x, y } = state.pointer;
  });

  return (
    <group ref={cameraGroupRef}>
      <Editable theaterKey="Camera / Transformations">
        <PerspectiveCamera makeDefault fov={22} />;
      </Editable>
    </group>
  );
};

export default CustomCamera;
