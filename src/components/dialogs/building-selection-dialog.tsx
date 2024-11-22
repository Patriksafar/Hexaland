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

interface BuildingSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (buildingType: string) => void
}

const BuildingSelectionDialog: React.FC<BuildingSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const buildings = Object.keys(buildingUrls)
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)

  const handleBuildClick = () => {
    if (selectedBuilding) {
      onSelect(selectedBuilding)
      onClose()
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