import { useGLTF } from "@react-three/drei"
import { memo } from "react"
import * as THREE from 'three'

useGLTF.preload('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forest.gltf-JfwNfQ3LGbUAeEbTPuRg03zc6qNdlO.glb')

const ForestModel = () => {
  const { scene } = useGLTF('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forest.gltf-JfwNfQ3LGbUAeEbTPuRg03zc6qNdlO.glb')
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
      if (child.material) {
        child.material.shadowSide = THREE.FrontSide
        child.material.side = THREE.DoubleSide
      }
    }
  })

  return <primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />
}

export default memo(ForestModel)