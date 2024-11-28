import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BuildingType, buildingUrls } from "../models/building-model"
import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import BuildingModel from "../models/building-model"
import { useResources } from "@/hooks/useResources"

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a building</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {buildings.map((building) => (
            <Button
              key={building}
              onClick={() => setSelectedBuilding(building)}
              variant={selectedBuilding === building ? "default" : "outline"}
              className="capitalize"
            >
              {building}
            </Button>
          ))}
        </div>
        {selectedBuilding && (
          <div className="py-4">
            <h3>Resource Cost:</h3>
            <p>Grain: {buildingCosts[selectedBuilding as BuildingType].grain}</p>
            <p>Wood: {buildingCosts[selectedBuilding as BuildingType].wood}</p>
            <div className="h-48 w-full bg-stone-100 rounded-md">
              <Canvas
                camera={{ position: [4, 4, 4], fov: 50 }}
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
                <OrbitControls enableZoom={false} autoRotate />
                <BuildingModel type={selectedBuilding as BuildingType} />
              </Canvas>
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