import { useEffect, useMemo, useRef } from "react";
import { useRenderPipeline } from "@react-three/tsl";
import {
  max,
  mrt,
  output,
  saturation,
  uniform,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { types } from "@theatre/core";
import { sheet } from "../Theatre/init";
import { chromaticAberration } from "three/addons/tsl/display/ChromaticAberrationNode.js";

const OBJECT_KEY = "Post / Grade";

// Middle grey in linear space: contrast pivots around this so mids stay put
const PIVOT = 0.18;

const PostProcessing = () => {
  const uSaturation = useMemo(() => uniform(1.3), []);
  const uContrast = useMemo(() => uniform(1.15), []);
  const uExposure = useMemo(() => uniform(1.0), []);
  const uChromaticAberration = useMemo(() => uniform(0.2), []);

  const bloomRef = useRef<ReturnType<typeof bloom> | null>(null);

  useRenderPipeline(
    ({ renderPipeline, passes }) => {
      const sceneColor = passes.scenePass.getTextureNode("output");
      // Each material writes the color it should glow with (black = no glow)
      const glowColor = passes.scenePass.getTextureNode("bloomColor");

      const bloomPass = bloom(glowColor, 1.2, 0.25, 0.0);
      bloomRef.current = bloomPass;

      const lit = sceneColor.rgb.add(bloomPass.rgb).mul(uExposure);

      // Lens fringing: R/G/B sampled at slightly different positions.
      // Returns a vec4, so take .rgb before the (vec3) grading steps.
      // (Cast: @types/three is missing the node methods on this class.)
      const fringed = (
        chromaticAberration(
          vec4(lit, 1),
          uChromaticAberration,
          // Point that stays sharp. Must be passed: three's "null = center"
          // default isn't actually handled in the shader code.
          vec2(0.5, 0.5),
        ) as unknown as ReturnType<typeof vec4>
      ).rgb;

      // Contrast in log space: darks get darker, brights get brighter
      const contrasted = vec3(PIVOT).mul(
        max(fringed, vec3(0)).div(PIVOT).pow(vec3(uContrast)),
      );

      // Saturation: push colors away from grey (clamp so it can't go negative)
      const graded = max(saturation(contrasted, uSaturation), vec3(0));

      renderPipeline.outputNode = vec4(graded, 1);
    },
    ({ passes }) => {
      // Default for objects without their own mrtNode: black = no glow
      passes.scenePass.setMRT(mrt({ output, bloomColor: vec3(0) }));
    },
  );

  useEffect(() => {
    const object = sheet.object(
      OBJECT_KEY,
      {
        bloomStrength: types.number(1.2, {
          range: [0, 5],
          nudgeMultiplier: 0.01,
        }),
        bloomRadius: types.number(0.25, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
        saturation: types.number(1.3, { range: [0, 3], nudgeMultiplier: 0.01 }),
        contrast: types.number(1.15, {
          range: [0.5, 2],
          nudgeMultiplier: 0.01,
        }),
        exposure: types.number(1.0, { range: [0, 3], nudgeMultiplier: 0.01 }),
        chromaticAberration: types.number(0.2, {
          range: [0, 2],
          nudgeMultiplier: 0.01,
        }),
      },
      { reconfigure: true },
    );

    const unsubscribe = object.onValuesChange((v) => {
      uSaturation.value = v.saturation;
      uContrast.value = v.contrast;
      uExposure.value = v.exposure;
      uChromaticAberration.value = v.chromaticAberration;
      if (bloomRef.current) {
        bloomRef.current.strength.value = v.bloomStrength;
        bloomRef.current.radius.value = v.bloomRadius;
      }
    });

    return () => unsubscribe();
  }, [uSaturation, uContrast, uExposure, uChromaticAberration]);

  return null;
};

export default PostProcessing;
