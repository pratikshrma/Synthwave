import { useRenderPipeline } from "@react-three/tsl";
import { float, mrt, output } from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";

const PostProcessing = () => {
  useRenderPipeline(
    ({ renderPipeline, passes }) => {
      const sceneColor = passes.scenePass.getTextureNode("output");
      const glowMask = passes.scenePass.getTextureNode("bloomIntensity").r;

      renderPipeline.outputNode = sceneColor.add(
        bloom(sceneColor.mul(glowMask), 1.0, 0.1, 0.0),
      );
    },
    ({ passes }) => {
      passes.scenePass.setMRT(mrt({ output, bloomIntensity: float(0.2) }));
    },
  );
  return null;
};

export default PostProcessing;
