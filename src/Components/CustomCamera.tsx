import { PerspectiveCamera } from "@react-three/drei";
import Editable from "../Theatre/Editable";

const CustomCamera = () => {
  return (
    <Editable theaterKey="Camera / Transformations">
      <PerspectiveCamera makeDefault fov={22} />;
    </Editable>
  );
};

export default CustomCamera;
