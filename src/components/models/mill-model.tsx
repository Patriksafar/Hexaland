import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GroupProps, useFrame } from '@react-three/fiber'

import THREE from "three"

export function MillModel(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/mill.gltf.glb')
  
  const turbineRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (turbineRef.current) {
      turbineRef.current.rotation.z += 0.01
      // turbineRef.current.rotation.y -= 0.01
    }
  })


  return (
    <group dispose={null} {...props}>
      <mesh
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.Cylinder756.geometry}
        material={materials.Brown}
      />
      <mesh
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.Cylinder756_1.geometry}
        material={materials.Beige}
      />
      <mesh
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.Cylinder756_2.geometry}
        material={materials.BrownDark}
      />
      <mesh
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.Cylinder756_3.geometry}
        material={materials.White}
      />
      <mesh
        castShadow
        receiveShadow
        // @ts-ignore
        geometry={nodes.Cylinder756_4.geometry}
        material={materials.Stone}
      />
      <group ref={turbineRef} position={[0, 1.268, 0.17]}>
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          geometry={nodes.Cylinder757.geometry}
          material={materials.Brown}
        />
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          geometry={nodes.Cylinder757_1.geometry}
          material={materials.BrownDark}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/mill.gltf.glb')