"use client";

import { createContext, useContext, useState, ReactNode } from 'react'

interface Resources {
  grain: number
  wood: number
}

interface ResourceContextType {
  resources: Resources
  updateResources: (updates: Partial<Resources>) => void
}

const ResourceContext = createContext<ResourceContextType | null>(null)

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resources>({ grain: 0, wood: 0 })

  const updateResources = (updates: Partial<Resources>) => {
    setResources(prev => ({
      ...prev,
      ...updates
    }))
  }

  return (
    <ResourceContext.Provider value={{ resources, updateResources }}>
      {children}
    </ResourceContext.Provider>
  )
}

export function useResources() {
  const context = useContext(ResourceContext)
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider')
  }
  return context
} 