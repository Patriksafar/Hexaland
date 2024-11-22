import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { buildingUrls } from "../models/building-model"

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
  const buildings = [...Object.keys(buildingUrls), "grain"]

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
              onClick={() => {
                onSelect(building)
                onClose()
              }}
              variant="outline"
              className="capitalize"
            >
              {building}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BuildingSelectionDialog 