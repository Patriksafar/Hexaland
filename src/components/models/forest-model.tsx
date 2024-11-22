import { useGLTF } from "@react-three/drei"
import * as THREE from 'three'

const ForestModel = () => {
  const { scene } = useGLTF('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forest.gltf-JfwNfQ3LGbUAeEbTPuRg03zc6qNdlO.glb')
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return <primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />
}

useGLTF.preload('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/forest.gltf-JfwNfQ3LGbUAeEbTPuRg03zc6qNdlO.glb')

export default ForestModel