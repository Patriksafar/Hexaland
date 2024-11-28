import { useGLTF } from "@react-three/drei"
import { memo } from "react"
import { Mesh } from "three"

type GrainModelProps = {
  type: "full-grown" | "harvested"
}

const grainModelsPerType: Record<GrainModelProps["type"], string> = {
  "full-grown": "./models/grain.glb",
  "harvested": "./models/dirt.glb"
}

const GrainModel = ({ type }:GrainModelProps) => {
  const { scene } = useGLTF(grainModelsPerType[type])

  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })


  return  (
      <primitive 
        object={scene.clone()} 
        scale={[0.55, 0.55, 0.55]} 
        position={[0, 0, 0]} 
      />
    )
 }


useGLTF.preload(grainModelsPerType["full-grown"])
useGLTF.preload(grainModelsPerType["harvested"])

export default memo(GrainModel)
