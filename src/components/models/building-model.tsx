import { useGLTF } from "@react-three/drei"
import { memo } from "react"
import { Mesh } from "three"
import HorseModel from "./horse"
import { MillModel } from "./mill-model"

export const buildingUrls = {
  house: './models/house.glb',
  mill: './models/mill.gltf.glb',
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

  if(type === "mill") {
    return (
      <group rotation={[0, rotation || 0, 0]}>
        <MillModel scale={[0.5, 0.5, 0.5]} />
      </group>
    )
  }

  return <group rotation={[0, rotation || 0, 0]}>
    {type === "stables" && (
      <HorseModel />
    )}
      <primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />
    </group>
 }

 // Preload all building models
Object.entries(buildingUrls).forEach(([, url]) => {
  useGLTF.preload(url)
})

 
export default memo(BuildingModel)