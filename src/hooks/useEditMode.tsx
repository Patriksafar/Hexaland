import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  isBuildMode: boolean;
  toggleBuildMode: () => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const EditModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBuildMode, setIsBuildMode] = useState(false);

  const toggleEditMode = () => {
    setIsBuildMode(false);
    setIsEditMode(prev => !prev);
  };

  const toggleBuildMode = () => {
    setIsEditMode(false);
    setIsBuildMode(prev => !prev);
  };

  return (
    <EditModeContext.Provider value={{ 
      isEditMode, 
      toggleEditMode,
      isBuildMode,
      toggleBuildMode
    }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};
