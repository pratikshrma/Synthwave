import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import Editable from "../Theatre/Editable";
import {
  Fn,
  uniform,
  uv,
  mix,
  vec3,
  mx_worley_noise_float,
  mrt,
  color,
} from "three/tsl";
import { sheet } from "../Theatre/init";
import { types } from "@theatre/core";

const OBJECT_KEY = "Sun / Texture / Colors";

const Sun = () => {
  const uSunLightColor = useMemo(() => uniform(new THREE.Color("#FF8C14")), []);
  const uSunDarkColor = useMemo(() => uniform(new THREE.Color("#FF1450")), []);
  const uVoroniNoiseStepLow = useMemo(() => uniform(0.2), []);
  const uUvAdd = useMemo(() => uniform(0.2), []);
  const uSunGlow = useMemo(() => uniform(0.4), []);

  useEffect(() => {
    const object = sheet.object(OBJECT_KEY, {
      lightColor: types.rgba({ r: 1, g: 0.549, b: 0.078, a: 1 }),
      darkColor: types.rgba({ r: 1, g: 0.078, b: 0.314, a: 1 }),
      voroniNoiseStepLow: types.number(0.2, {
        range: [0, 1],
        nudgeMultiplier: 0.01,
      }),
      uvAdd: types.number(0.4, {
        range: [0, 1],
        nudgeMultiplier: 0.01,
      }),
      glow: types.number(0.4, {
        range: [0, 2],
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
      uSunGlow.value = v.glow;
    });

    return () => {
      unsubscribe();
      sheet.detachObject(OBJECT_KEY);
    };
  }, [uSunLightColor, uSunDarkColor, uVoroniNoiseStepLow, uUvAdd, uSunGlow]);

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.CircleGeometry(60, 64);
    const material = new THREE.MeshBasicNodeMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    });

    material.colorNode = Fn(() => {
      // Keep values <= 1: anything above gets compressed toward white (pastel)
      const color = mix(uSunDarkColor, uSunLightColor, uv().y.pow(2.0));
      return color;
    })();

    // Sun shape + stripes (1 = visible, 0 = cut out).
    // Shared by opacity and glow so the stripes don't glow either.
    const sunMask = Fn(() => {
      const shape = vec3(uv().y.oneMinus().add(uUvAdd))
        .pow(2)
        .remap(0.24, 0.74, -1.31, 0.26);

      return mx_worley_noise_float(shape.mul(1.5)).step(uVoroniNoiseStepLow);
    })();

    material.opacityNode = sunMask;

    // Glow COLOR, not just amount: the halo uses the pink/red bottom color,
    // so it reads magenta against the navy sky instead of orange -> lavender.
    material.mrtNode = mrt({
      bloomColor: color(uSunDarkColor).mul(uSunGlow).mul(sunMask),
    });

    return { geometry, material };
  }, [uSunLightColor, uSunDarkColor]);

  return (
    <Editable theaterKey="Sun / Transformations">
      <mesh geometry={geometry} material={material} rotation={[0, 1.57, 0]} />
    </Editable>
  );
};

export default Sun;
