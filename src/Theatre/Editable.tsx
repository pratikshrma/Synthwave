import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { useTheatreTransforms } from "./useTheatreTransforms.ts";

const Editable = ({
  theaterKey,
  children,
  ...props
}: { theaterKey: string } & ThreeElements["group"]) => {
  const ref = useTheatreTransforms<THREE.Group>(theaterKey);

  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
};

export default Editable;
