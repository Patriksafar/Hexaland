import { useGLTF } from "@react-three/drei"
import { memo } from "react"
import { Mesh } from "three"

type GrainModelProps = {
  type: "full-grown" | "dirt"
}

const grainModelsPerType: Record<GrainModelProps["type"], string> = {
  "full-grown": "./models/grain.glb",
  "dirt": "./models/dirt.glb"
}

const GrainModel = ({ type }:GrainModelProps) => {
  const { scene } = useGLTF(grainModelsPerType["full-grown"])
  const { scene: dirtScene } = useGLTF(grainModelsPerType["dirt"])

  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  dirtScene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return  (
    <group>
      <primitive
        object={dirtScene.clone()}
        scale={[0.55, 0.8, 0.55]}
        position={[0, 0, 0]}
      />
      {type !== "dirt" && (
        <primitive 
          object={scene.clone()} 
          scale={[0.55, 0.55, 0.55]} 
          position={[0, 0.05, 0]} 
        />
      )}
    </group>
    )
 }


useGLTF.preload(grainModelsPerType["full-grown"])
useGLTF.preload(grainModelsPerType["dirt"])

export default memo(GrainModel)
