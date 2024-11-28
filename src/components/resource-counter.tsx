'use client'

import { useResources } from '@/hooks/useResources'

export default function ResourceCounter() {
  const { resources } = useResources()

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-white/80 rounded-lg p-4 shadow-lg">
        <h2 className="font-bold mb-2">Resources</h2>
        <p>Grain: {resources.grain}</p>
        <p>Wood: {resources.wood}</p>
        <p>Gold: {resources.gold}</p>
        <p>Stone: {resources.stone}</p>
        <p>Iron: {resources.iron}</p>
      </div>
    </div>
  )
} 