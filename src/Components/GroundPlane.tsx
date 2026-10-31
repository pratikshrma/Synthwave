import { useLocalNodes } from "@react-three/tsl";
import * as THREE from "three/webgpu";
import {
  abs,
  color,
  float,
  fract,
  Fn,
  fwidth,
  min,
  mix,
  mrt,
  positionLocal,
  uv,
  attribute,
  uniform,
} from "three/tsl";
import { useEffect, useMemo, useRef } from "react";
import { seededRandom } from "three/src/math/MathUtils.js";
import InstancedBalls from "./InstancedBalls";
import { useThree } from "@react-three/fiber";
import type { Inspector } from "three/examples/jsm/inspector/Inspector.js";
import remapClamp from "../Helper/remapClamp";
import { Sparkles } from "@react-three/drei/webgpu";

const SEGMENTS = 55;
const PLANE_SIZE = 30;

const REPETETION = 4;

const GroundPlane = () => {
  const renderer = useThree((t) => t.renderer);

  const uPlaneColor = useMemo(() => uniform(new THREE.Color("#25072b")), []);
  const uLinesColor = useMemo(() => uniform(new THREE.Color("#e5213e")), []);
  const uLinesThickness = useMemo(() => uniform(1.5), []);

  const inspectorElementCreated = useRef(false);

  useEffect(() => {
    if (renderer.inspector && !inspectorElementCreated.current) {
      const ground = (renderer.inspector as Inspector).createParameters(
        "Ground",
      );
      ground.addColor(uPlaneColor, "value").name("Plane Color");
      ground.addColor(uLinesColor, "value").name("Lines Color");
      ground
        .add(uLinesThickness, "value", 0.1, 10, 0.01)
        .name("Lines Thickness");

      inspectorElementCreated.current = true;
    }
  }, [uPlaneColor, uLinesColor, renderer]);

  const groundPlaneOffsets = useMemo(() => {
    const count = (SEGMENTS + 1) * (SEGMENTS + 1);
    const yOffset = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const rand = seededRandom(i);
      yOffset[i] = remapClamp(rand, 0, 1, 0.3, 0.7);
    }
    return yOffset;
  }, [SEGMENTS]);

  const { positionNode, colorNode, glowMrt } = useLocalNodes(() => {
    const aOffset = attribute("aOffset", "float");

    const positionNode = Fn(() => {
      const p = positionLocal.toVar();
      p.z.addAssign(aOffset);
      return p;
    })();

    const lineWidth = float(uLinesThickness); // local value, NOT three's `thickness`

    const lineMask = Fn(() => {
      const g = uv().mul(SEGMENTS);
      const d = abs(fract(g.sub(0.5)).sub(0.5))
        .div(fwidth(g))
        .div(lineWidth);
      return float(1).sub(min(min(d.x, d.y), 1));
    })();

    return {
      positionNode,
      colorNode: mix(color(uPlaneColor), color(uLinesColor), lineMask),
      glowMrt: mrt({ bloomIntensity: lineMask }),
    };
  }, []);

  return (
    <>
      {Array.from({ length: REPETETION }).map((_, i) => {
        return (
          <group key={i} position={[i * PLANE_SIZE, -1, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry
                args={[PLANE_SIZE, PLANE_SIZE, SEGMENTS, SEGMENTS]}
              >
                <bufferAttribute
                  attach="attributes-aOffset"
                  args={[groundPlaneOffsets, 1]}
                />
              </planeGeometry>
              <meshBasicNodeMaterial
                positionNode={positionNode}
                colorNode={colorNode}
                mrtNode={glowMrt}
                side={THREE.DoubleSide}
              />
            </mesh>
            <InstancedBalls
              SIZE={PLANE_SIZE}
              SEGMENTS={SEGMENTS}
              yOffset={groundPlaneOffsets}
            />
            <Sparkles
              color={"#fff"}
              scale={[PLANE_SIZE, PLANE_SIZE, PLANE_SIZE * 1.5]}
              size={10}
              count={500}
            />
          </group>
        );
      })}
    </>
  );
};

export default GroundPlane;
