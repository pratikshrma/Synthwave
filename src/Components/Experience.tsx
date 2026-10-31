import { Canvas } from "@react-three/fiber";
import GroundPlane from "./GroundPlane";
import { OrbitControls } from "@react-three/drei";
import PostProcessing from "./PostProcessing";
import { Inspector } from "three/examples/jsm/inspector/Inspector.js";
import { theatreInit } from "../Theatre/init";
import CustomCamera from "./CustomCamera";
import Sun from "./Sun";

theatreInit();

const Sheel = () => {
  return (
    <>
      {/* <OrbitControls /> */}
      <ambientLight color={"#fff"} intensity={1} />
      <CustomCamera />
      <GroundPlane />
      <Sun />
      <PostProcessing />
    </>
  );
};

const Experience = () => {
  return (
    <Canvas
      renderer={{
        shadows: "percentage",
      }}
      background="envMap/background.exr"
      onCreated={({ renderer }) => {
        const inspector = new Inspector();
        document.body.appendChild(inspector.domElement);
        renderer.inspector = inspector;
        inspector.setVisible(false);
      }}
    >
      <Sheel />
    </Canvas>
  );
};

export default Experience;
