import { PerspectiveCamera } from "@react-three/drei";
import Editable from "../Theatre/Editable";
import { useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import remapClamp from "../Helper/remapClamp";

const BASE_FOV = 22; // vertical FOV on your design screen
const BASE_ASPECT = 16 / 9; // the aspect ratio you designed for

const CustomCamera = () => {
  const cameraGroupRef = useRef<THREE.PerspectiveCamera | null>(null);
  const { size } = useThree();

  const fov = useMemo(() => {
    const aspect = size.width / size.height;
    if (aspect >= BASE_ASPECT) return BASE_FOV;

    // keep the horizontal FOV from the base aspect, so narrower screens see the same width
    const vRad = THREE.MathUtils.degToRad(BASE_FOV);
    const hRad = 2 * Math.atan(Math.tan(vRad / 2) * BASE_ASPECT);
    const newV = 2 * Math.atan(Math.tan(hRad / 2) / aspect);
    return THREE.MathUtils.radToDeg(newV);
  }, [size.width, size.height]);

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
      <PerspectiveCamera ref={cameraGroupRef} makeDefault fov={fov} />
    </Editable>
  );
};

export default CustomCamera;
