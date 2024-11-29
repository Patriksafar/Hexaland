import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

export const Shovel = (props: GroupProps) => {
  const { nodes, materials } = useGLTF('./models/shovel.glb')
  
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.shovel.geometry}
        material={materials.hexagons_medieval}
      />
    </group>
  )
}

useGLTF.preload('./models/shovel.glb')