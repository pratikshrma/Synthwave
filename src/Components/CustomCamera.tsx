import { PerspectiveCamera } from "@react-three/drei";
import Editable from "../Theatre/Editable";
import { useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import remapClamp from "../Helper/remapClamp";

const CustomCamera = () => {
  const cameraGroupRef = useRef<THREE.PerspectiveCamera | null>(null);
  useFrame((state, delta) => {
    if (cameraGroupRef.current) {
      const { x, y } = state.pointer;
      const currentYRotation = cameraGroupRef.current.rotation.y;
      const currentXRotation = cameraGroupRef.current.rotation.x;

      cameraGroupRef.current.rotation.y = THREE.MathUtils.damp(
        currentYRotation,
        remapClamp(x, -1, 1, 0.05, -0.05),
        6,
        delta,
      );

      cameraGroupRef.current.rotation.x = THREE.MathUtils.damp(
        currentXRotation,
        remapClamp(y, -1, 1, -0.03, 0.03),
        6,
        delta,
      );
    }
  });

  return (
    <Editable theaterKey="Camera / Transformations">
      <PerspectiveCamera ref={cameraGroupRef} makeDefault fov={22} />;
    </Editable>
  );
};

export default CustomCamera;
