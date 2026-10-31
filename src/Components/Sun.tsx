import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import Editable from "../Theatre/Editable";
import { Fn, uniform, uv, mix, vec3, mx_worley_noise_float } from "three/tsl";
import { sheet } from "../Theatre/init";
import { types } from "@theatre/core";

const OBJECT_KEY = "Sun / Texture / Colors";

const Sun = () => {
  const uSunLightColor = useMemo(() => uniform(new THREE.Color("#FF4800")), []);
  const uSunDarkColor = useMemo(() => uniform(new THREE.Color("#FF0020")), []);
  const uVoroniNoiseStepLow = useMemo(() => uniform(0.2), []);
  const uUvAdd = useMemo(() => uniform(0.2), []);

  useEffect(() => {
    const object = sheet.object(OBJECT_KEY, {
      lightColor: types.rgba({ r: 1, g: 0.282, b: 0, a: 1 }),
      darkColor: types.rgba({ r: 1, g: 0, b: 0.125, a: 1 }),
      voroniNoiseStepLow: types.number(0.2, {
        range: [0, 1],
        nudgeMultiplier: 0.01,
      }),
      uvAdd: types.number(0.4, {
        range: [0, 1],
        nudgeMultiplier: 0.01,
      }),
    });

    const unsubscribe = object.onValuesChange((v) => {
      uSunLightColor.value.setRGB(
        v.lightColor.r,
        v.lightColor.g,
        v.lightColor.b,
        THREE.SRGBColorSpace,
      );
      uSunDarkColor.value.setRGB(
        v.darkColor.r,
        v.darkColor.g,
        v.darkColor.b,
        THREE.SRGBColorSpace,
      );
      uVoroniNoiseStepLow.value = v.voroniNoiseStepLow;
      uUvAdd.value = v.uvAdd;
    });

    return () => {
      unsubscribe();
      sheet.detachObject(OBJECT_KEY);
    };
  }, [uSunLightColor, uSunDarkColor, uVoroniNoiseStepLow, uUvAdd]);

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.CircleGeometry(60, 64);
    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    });

    material.colorNode = Fn(() => {
      const color = mix(uSunDarkColor, uSunLightColor, uv().y);
      return color;
    })();

    material.opacityNode = Fn(() => {
      const shape = vec3(uv().y.oneMinus().add(uUvAdd))
        .pow(2)
        .remap(0.24, 0.74, -1.31, 0.26);

      const voronoiNoise = mx_worley_noise_float(shape.mul(1.5)).step(
        uVoroniNoiseStepLow,
      );
      return voronoiNoise;
    })();

    return { geometry, material };
  }, [uSunLightColor, uSunDarkColor]);

  return (
    <Editable theaterKey="Sun / Transformations">
      <mesh geometry={geometry} material={material} rotation={[0, 1.57, 0]} />
    </Editable>
  );
};

export default Sun;
