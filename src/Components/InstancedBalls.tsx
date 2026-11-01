import { useEffect, useMemo } from "react";
import { types } from "@theatre/core";
import { sheet } from "../Theatre/init";
import {
  attribute,
  color,
  Fn,
  mix,
  mrt,
  normalView,
  positionLocal,
  positionViewDirection,
  uniform,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";
import { seededRandom } from "three/src/math/MathUtils.js";

type InstancedBallsType = {
  SIZE: number;
  SEGMENTS: number;
  yOffset: Float32Array;
};

const GLOW_KEY = "Balls / Glow";

// Shared by all InstancedBalls copies so one Theatre object controls them all
const uBallGlowColor = uniform(new THREE.Color("#ff3366"));
const uBallGlow = uniform(0.5);

const InstancedBalls = ({ SIZE, SEGMENTS, yOffset }: InstancedBallsType) => {
  useEffect(() => {
    const object = sheet.object(
      GLOW_KEY,
      {
        glowColor: types.rgba({ r: 1, g: 0.2, b: 0.4, a: 1 }),
        glow: types.number(0.5, { range: [0, 3], nudgeMultiplier: 0.01 }),
      },
      { reconfigure: true },
    );

    const unsubscribe = object.onValuesChange((v) => {
      uBallGlowColor.value.setRGB(
        v.glowColor.r,
        v.glowColor.g,
        v.glowColor.b,
        THREE.SRGBColorSpace,
      );
      uBallGlow.value = v.glow * v.glowColor.a;
    });

    return () => unsubscribe();
  }, []);

  const ballsMesh = useMemo(() => {
    const plane = new THREE.PlaneGeometry(
      SIZE,
      SIZE,
      SEGMENTS,
      SEGMENTS,
    ) as THREE.PlaneGeometry;
    const positions = plane.attributes.position.array;
    plane.dispose();

    const _segments = SEGMENTS + 1;
    const totalPositions = _segments * _segments;
    const modifiedPositions = new Float32Array(totalPositions * 4);
    for (let i = 0; i < totalPositions; i++) {
      const r = i * 3;
      const w = i * 4;
      modifiedPositions[w + 0] = positions[r + 0];
      modifiedPositions[w + 1] = positions[r + 1];
      modifiedPositions[w + 2] = positions[r + 2] + 0.1 + yOffset[i];
      modifiedPositions[w + 3] = seededRandom(i);
    }

    const sphereGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    sphereGeometry.rotateX(-Math.PI / 2);

    const geo = new THREE.InstancedBufferGeometry();
    geo.instanceCount = totalPositions;

    geo.setIndex(sphereGeometry.index);

    geo.setAttribute("position", sphereGeometry.attributes.position);
    geo.setAttribute("normal", sphereGeometry.attributes.normal);
    geo.setAttribute("uv", sphereGeometry.attributes.uv);

    geo.setAttribute(
      "aOffset",
      new THREE.InstancedBufferAttribute(modifiedPositions, 4),
    );

    // Unlit: the balls are light sources, so the ambient light shouldn't flatten them
    const ballMaterial = new THREE.MeshBasicNodeMaterial({
      side: THREE.DoubleSide,
    });

    const aOffset = attribute("aOffset", "vec4");
    ballMaterial.positionNode = Fn(() => {
      const position = positionLocal.toVar();
      position.mulAssign(aOffset.a); //this is random scale
      position.addAssign(aOffset.xyz);
      return position;
    })();

    // White-hot core, red at the edges (fresnel)
    ballMaterial.colorNode = Fn(() => {
      const nDotV = normalView.dot(positionViewDirection).abs().pow(0.1);
      const colorA = color("#fff");
      const colorB = color("#f00");
      const finalColor = mix(colorA, colorB, nDotV.oneMinus());

      return vec3(finalColor).mul(1.0);
    })();

    // The halo color is separate from the surface color: white ball, pink glow
    ballMaterial.mrtNode = mrt({
      bloomColor: color(uBallGlowColor).mul(uBallGlow),
    });

    return new THREE.Mesh(geo, ballMaterial);
  }, []);

  return (
    <primitive
      frustumCulled={false}
      object={ballsMesh}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
};

export default InstancedBalls;
