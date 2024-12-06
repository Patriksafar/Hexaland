import { useEditMode } from "@/hooks/useEditMode";


export const EditModeController = () => {
  const { isEditMode, toggleEditMode } = useEditMode();
  
  const handleDeleteMap = async () => {
    // DELETE MAP LOGIC
    await fetch(`/api/tiles`, {
      method: 'DELETE',
    })
  }

  return (
    <div className="fixed top-0 right-0 p-4 z-10">
      {process.env.NODE_ENV === 'development' && (
        <button onClick={handleDeleteMap}>
        Delete map
      </button>
      )}
      <button
        className="p-2 bg-gray-700 text-white rounded select-none"
        onClick={toggleEditMode}
      >
        {isEditMode ? "Exit Edit mode" : "Edit Mode"}
      </button>
    </div>
  );
}