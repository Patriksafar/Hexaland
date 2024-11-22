import { useGLTF } from "@react-three/drei"
import { Mesh } from "three"

const GrainModel = () => {
  const { scene } = useGLTF("./grain.glb")
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return <primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />
 }

// Preload all building models
useGLTF.preload("./grain.glb")
 
export default GrainModel