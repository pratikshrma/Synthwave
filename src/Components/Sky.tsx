import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { types } from "@theatre/core";
import { sheet } from "../Theatre/init";

const OBJECT_KEY = "Sky";

// Same idea as Blender's World "Strength": dims the background.exr
const Sky = () => {
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const object = sheet.object(
      OBJECT_KEY,
      {
        brightness: types.number(0.4, { range: [0, 2], nudgeMultiplier: 0.01 }),
      },
      { reconfigure: true },
    );

    const unsubscribe = object.onValuesChange((v) => {
      scene.backgroundIntensity = v.brightness;
    });

    return () => unsubscribe();
  }, [scene]);

  return null;
};

export default Sky;
