import { useGLTF } from "@react-three/drei"
import { memo } from "react"
import { Mesh } from "three"

export const buildingUrls = {
  house: './models/house.glb',
  mill: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mill.gltf-ZX2lvfQwfReGhfS1Ux1p0TPGDLvCxA.glb',
  well: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/well.gltf-4ESFijtJBFdnnQiZyYCJSjiXAHZFEq.glb',
  barracks: './models/archery-range.glb',
  market: './models/market.glb',
  watchtower: './models/watchtower.glb',
  mine: "./models/mine.glb",
  lumbermill: "./models/lumbermill.glb",
  castle: './models/castle.glb',
  grain: "./models/grain.glb",
  "tavern": "./models/tavern.glb",
  "blacksmith": "./models/blacksmith.glb",
  stables: "./models/stables.glb",
  church: "./models/church.glb",
}
export type BuildingType = keyof typeof buildingUrls

const BuildingModel = ({ type, rotation }: { type: BuildingType, rotation?: number }) => {
  const { scene } = useGLTF(buildingUrls[type])
  
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return <group rotation={[0, rotation || 0, 0]}><primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} /></group>
 }

 // Preload all building models
Object.entries(buildingUrls).forEach(([, url]) => {
  useGLTF.preload(url)
})

 
export default memo(BuildingModel)