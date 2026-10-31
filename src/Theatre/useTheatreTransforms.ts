import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { sheet } from "./init.ts";
import { types } from "@theatre/core";

export function useTheatreTransforms<T extends THREE.Object3D>(name: string) {
  const ref = useRef<T>(null); //this ref is the group that holds a mesh

  useEffect(() => {
    if (!ref.current) return;
    const group = ref.current;
    const obj = sheet.object(
      name,
      {
        position: types.compound({
          x: types.number(group.position.x, { nudgeMultiplier: 0.01 }),
          y: types.number(group.position.y, { nudgeMultiplier: 0.01 }),
          z: types.number(group.position.z, { nudgeMultiplier: 0.01 }),
        }),
        rotation: types.compound({
          x: types.number(group.rotation.x, { nudgeMultiplier: 0.01 }),
          y: types.number(group.rotation.y, { nudgeMultiplier: 0.01 }),
          z: types.number(group.rotation.z, { nudgeMultiplier: 0.01 }),
        }),
        scale: types.compound({
          x: types.number(group.scale.x, { nudgeMultiplier: 0.01 }),
          y: types.number(group.scale.y, { nudgeMultiplier: 0.01 }),
          z: types.number(group.scale.z, { nudgeMultiplier: 0.01 }),
        }),
      },
      { reconfigure: true },
    );

    const unsubscribe = obj.onValuesChange((value) => {
      ref.current?.position.set(
        value.position.x,
        value.position.y,
        value.position.z,
      );
      ref.current?.rotation.set(
        value.rotation.x,
        value.rotation.y,
        value.rotation.z,
      );
      ref.current?.scale.set(value.scale.x, value.scale.y, value.scale.z);
    });

    return unsubscribe;
  }, [ref]);

  return ref;
}
