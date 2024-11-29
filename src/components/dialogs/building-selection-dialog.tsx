import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BuildingType, buildingUrls } from "../models/building-model"
import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import BuildingModel from "../models/building-model"

const buildingCosts: Record<BuildingType, { grain: number; wood: number }> = {
  house: { grain: 10, wood: 5 },
  mill: { grain: 15, wood: 10 },
  well: { grain: 5, wood: 2 },
  barracks: { grain: 20, wood: 15 },
  market: { grain: 25, wood: 20 },
  watchtower: { grain: 30, wood: 25 },
  mine: { grain: 35, wood: 30 },
  lumbermill: { grain: 40, wood: 35 },
  castle: { grain: 50, wood: 50 },
  grain: { grain: 5, wood: 1 },
  tavern: { grain: 10, wood: 5 },
  blacksmith: { grain: 15, wood: 10 },
  stables: { grain: 20, wood: 15 },
  church: { grain: 25, wood: 20 },
}

interface BuildingSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (buildingType: string) => void
  resources: { grain: number; wood: number }
  updateResources: (updates: Partial<{ grain: number; wood: number }>) => void
}

const BuildingSelectionDialog: React.FC<BuildingSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  resources,
  updateResources
}) => {
  const buildings = Object.keys(buildingUrls) as BuildingType[]
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)

  const handleBuildClick = () => {
    if (selectedBuilding) {
      const cost = buildingCosts[selectedBuilding as BuildingType]
      if (resources.grain >= cost.grain && resources.wood >= cost.wood) {
        updateResources({
          grain: resources.grain - cost.grain,
          wood: resources.wood - cost.wood,
        })
        onSelect(selectedBuilding)
        onClose()
      } else {
        alert("Not enough resources to build this structure.")
      }
    }
  }

  useEffect(() => {
    setSelectedBuilding(null)
  }
  , [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a building</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {buildings.map((building) => (
            <button 
              disabled={resources.grain < buildingCosts[building].grain || resources.wood < buildingCosts[building].wood} 
              key={building}
              className={`rounded-md overflow-hidden ${selectedBuilding === building ? "border-2 border-blue-500 bg-blue-200" : ""}`}
              onClick={() => setSelectedBuilding(building)}
            >
              <div className={`h-20 w-full ${resources.grain < buildingCosts[building].grain || resources.wood < buildingCosts[building].wood ? "bg-stone-800 grayscale" : ""}`}>
              <Canvas
                    camera={{ position: [1, 2, 1], fov: 40 }}
                    className="w-full h-full"
                  >
                    <ambientLight intensity={1.5} />
                    <directionalLight 
                      position={[-5, 5, -5]}
                      intensity={1.5}
                      castShadow
                    />
                    <hemisphereLight 
                      args={["#ffffff", "#b1e1ff", 1]}
                    />
                    <OrbitControls enableZoom={false} autoRotate minZoom={100} />
                    <BuildingModel type={building} />
                  </Canvas>
                </div>
            </button>
          ))}
        </div>
        {selectedBuilding && (
          <div>
          <div>
            <h3>Building: {selectedBuilding}</h3>
          </div>
          <div className="py-4">
            <h3>Resource Cost:</h3>
            <p>Grain: {buildingCosts[selectedBuilding as BuildingType].grain}</p>
            <p>Wood: {buildingCosts[selectedBuilding as BuildingType].wood}</p>
          </div>
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={handleBuildClick}
            disabled={!selectedBuilding}
            className="w-full"
          >
            Build
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BuildingSelectionDialog 