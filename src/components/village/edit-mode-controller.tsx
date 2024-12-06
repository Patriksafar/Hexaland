import { useEditMode } from "@/hooks/useEditMode";


export const EditModeController = () => {
  const { isEditMode, toggleEditMode } = useEditMode();
  
  return (
    <div className="fixed top-0 right-0 p-4 z-10">
      <button
        className="p-2 bg-gray-700 text-white rounded select-none"
        onClick={toggleEditMode}
      >
        {isEditMode ? "Exit Edit mode" : "Edit Mode"}
      </button>
    </div>
  );
}