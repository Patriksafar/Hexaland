

import { useGLTF } from "@react-three/drei"
import { memo } from "react"
import { Mesh } from "three"

type GrainModelProps = {
  type: "full-grown" | "cut"
}

const grainModelsPerType: Record<GrainModelProps["type"], string> = {
  "full-grown": "./models/trees_large.glb",
  "cut": "./models/trees_cut.glb"
}

const ForestModel = ({ type }:GrainModelProps) => {
  const { scene } = useGLTF(grainModelsPerType[type])

  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return  (
    <group>
      <primitive
        object={scene.clone()}
        scale={[0.55, 0.8, 0.55]}
        position={[0, 0, 0]}
      />
    </group>
    )
 }


useGLTF.preload(grainModelsPerType["full-grown"])
useGLTF.preload(grainModelsPerType["cut"])

export default memo(ForestModel)
