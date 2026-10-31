import { useMemo } from "react";
import {
  attribute,
  color,
  Fn,
  mix,
  normalView,
  positionLocal,
  positionViewDirection,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";

type InstancedBallsType = {
  SIZE: number;
  SEGMENTS: number;
  yOffset: Float32Array;
};

const InstancedBalls = ({ SIZE, SEGMENTS, yOffset }: InstancedBallsType) => {
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
    const modifiedPositions = new Float32Array(totalPositions * 3);
    for (let i = 0; i < totalPositions; i++) {
      const i3 = i * 3;
      modifiedPositions[i3 + 0] = positions[i3 + 0];
      modifiedPositions[i3 + 1] = positions[i3 + 1];
      modifiedPositions[i3 + 2] = positions[i3 + 2] + 0.1 + yOffset[i];
    }

    const sphereGeometry = new THREE.SphereGeometry(0.07, 8, 8);
    sphereGeometry.rotateX(-Math.PI / 2);

    const geo = new THREE.InstancedBufferGeometry();
    geo.instanceCount = totalPositions;

    geo.setIndex(sphereGeometry.index);

    geo.setAttribute("position", sphereGeometry.attributes.position);
    geo.setAttribute("normal", sphereGeometry.attributes.normal);
    geo.setAttribute("uv", sphereGeometry.attributes.uv);
    geo.setAttribute(
      "aOffset",
      new THREE.InstancedBufferAttribute(modifiedPositions, 3),
    );

    const ballMaterial = new THREE.MeshStandardNodeMaterial({
      side: THREE.DoubleSide,
    });

    const aOffset = attribute("aOffset", "vec3");
    ballMaterial.positionNode = Fn(() => {
      const position = positionLocal.toVar();
      position.addAssign(aOffset);
      return position;
    })();

    ballMaterial.emissiveNode = Fn(() => {
      const nDotV = normalView.dot(positionViewDirection).pow(2.0);
      const colorA = color("#fff");
      const colorB = color("#f00");
      const finalColor = mix(colorA, colorB, nDotV.oneMinus());

      return vec3(finalColor).mul(1.0);
    })();

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
