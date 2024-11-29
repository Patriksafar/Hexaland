import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GroupProps, useFrame } from '@react-three/fiber'
import { Shovel } from './tools/shovel'
import THREE from "three"

export const UnitModel = (props: GroupProps) => {
  const { nodes, materials } = useGLTF('./models/unit.glb')
  const shovelRef = React.useRef<THREE.Group>(null)

  const getRandomRotation = () => {
    return Math.random() * 2 * Math.PI
  }
  
  useFrame(() => {
    if (shovelRef.current) {
      shovelRef.current.position.y = Math.sin(Date.now() * 0.03) * 0.05;
    }
  });

  return (
    <group {...props} scale={props.scale ?? [0.4, 0.4, 0.4]} rotation={[0, getRandomRotation(), 0]}  dispose={null}>
      <group>
        <group ref={shovelRef} position={[-0.01, 0, 0]}>
          <Shovel position={[0.1, 0.15, -0.1]} rotation={[Math.PI / 1.5, 0, Math.PI / 1]}/>
        </group>
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          geometry={nodes.unit.geometry}
          material={materials.hexagons_medieval}
        />
      </group>
    </group>
  )
}

useGLTF.preload('./models/unit.glb')