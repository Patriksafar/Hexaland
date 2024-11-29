import { useGLTF } from "@react-three/drei"
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function HorseModel() {
  const { nodes, materials } = useGLTF('./models/horse_a.glb')
  const horseRef = useRef<THREE.Group>(null)
  let direction = 1; // 1 for forward, -1 for backward

  useFrame(() => {
    if (horseRef.current) {
      horseRef.current.position.z += 0.001 * direction; // Move in the current direction
      if (horseRef.current.position.z > 0.2) {
        horseRef.current.position.z = 0.2;
        direction = 0; // Stop movement
        setTimeout(() => {
          if(horseRef.current) {
            horseRef.current.rotation.y += Math.PI; // Rotate 180 degrees
          }
          direction = -1; // Change direction to backward after 5 seconds
        }, 5000);
      } else if (horseRef.current.position.z < 0) {
        horseRef.current.position.z = 0; 
        direction = 0; // Stop movement
        setTimeout(() => {
          if( horseRef.current) {
            horseRef.current.rotation.y += Math.PI; // Rotate 180 degrees
          }
          direction = 1; // Change direction to forward after 5 seconds
        }, 5000);
      }
    }
  })

  return (
    <group rotation={[0, Math.PI / 5, 0]} position={[-0.1, 0, 0.05]}>
      <group ref={horseRef} dispose={null} scale={[0.4, 0.4, 0.4]}>
        <mesh
          castShadow
          receiveShadow
          // @ts-ignore
          geometry={nodes.horse_A.geometry}
          material={materials.hexagons_medieval}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/horse_a.glb')

export default HorseModel