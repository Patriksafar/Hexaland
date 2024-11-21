import { useGLTF } from "@react-three/drei"
import { memo } from "react"
import * as THREE from 'three'
import { Mesh } from "three"

export const buildingUrls = {
  house: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/house.gltf-CvyRZxfyBZWdc8r4aMCTFmjfZ7oEMk.glb',
  mill: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mill.gltf-ZX2lvfQwfReGhfS1Ux1p0TPGDLvCxA.glb',
  well: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/well.gltf-4ESFijtJBFdnnQiZyYCJSjiXAHZFEq.glb',
  barracks: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/barracks.gltf-Yo1aIn1XDgi3S60WI6NZFuc711dnGc.glb',
  market: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/market.gltf-3BnnTDw3mUonjGcvDdAHUaWbU6YOqa.glb',
  watchtower: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/watchtower.gltf-XlLDeJFda3ghdreoKtEROiLnyu4SVt.glb',
  mine: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mine.gltf-IlfYGKmDADall7pG0zRoN2jIGj5QId.glb',
  lumbermill: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lumbermill.gltf-CjWbZic6KaLsiUEpC8AlRDkuUtTjxQ.glb',
  castle: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/castle.gltf-p4jD0gtKGAWaBl019phWRI4mKeBH2W.glb'
}

// Preload all building models
Object.entries(buildingUrls).forEach(([, url]) => {
  useGLTF.preload(url)
})

export type BuildingType = keyof typeof buildingUrls

const BuildingModel = ({ type }: { type: BuildingType }) => {
  const { scene } = useGLTF(buildingUrls[type])
  scene.traverse((child) => {
    if (child instanceof Mesh) {
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
 
export default memo(BuildingModel)