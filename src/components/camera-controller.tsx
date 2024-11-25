import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3, Quaternion } from 'three'

const CameraController = () => {
  const { camera, gl } = useThree()
  const MOVE_SPEED = 0.5
  const ROTATION_SPEED = 0.02
  const MOUSE_ROTATION_SPEED = 0.005
  const TARGET_HEIGHT = 0
  const CAMERA_OFFSET = new Vector3(0, 30, 30)
  
  const isDraggingRef = useRef(false)
  const previousMouseRef = useRef({ x: 0, y: 0 })
  
  const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    rotateLeft: false,
    rotateRight: false
  }

  useEffect(() => {
    // Set initial position
    const targetPosition = new Vector3(0, TARGET_HEIGHT, 0)
    camera.position.copy(targetPosition).add(CAMERA_OFFSET)
    camera.lookAt(targetPosition)

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveState.forward = true; break
        case 'KeyS': moveState.backward = true; break
        case 'KeyA': moveState.left = true; break
        case 'KeyD': moveState.right = true; break
        case 'KeyQ': moveState.rotateLeft = true; break
        case 'KeyE': moveState.rotateRight = true; break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveState.forward = false; break
        case 'KeyS': moveState.backward = false; break
        case 'KeyA': moveState.left = false; break
        case 'KeyD': moveState.right = false; break
        case 'KeyQ': moveState.rotateLeft = false; break
        case 'KeyE': moveState.rotateRight = false; break
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) { // Right mouse button
        isDraggingRef.current = true
        previousMouseRef.current = { x: event.clientX, y: event.clientY }
        gl.domElement.style.cursor = 'grabbing'
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        isDraggingRef.current = false
        gl.domElement.style.cursor = 'auto'
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return

      const deltaX = event.clientX - previousMouseRef.current.x
      const deltaY = event.clientY - previousMouseRef.current.y
      previousMouseRef.current = { x: event.clientX, y: event.clientY }

      // Get current target position (center of view)
      const targetPosition = new Vector3(
        camera.position.x - CAMERA_OFFSET.x,
        TARGET_HEIGHT,
        camera.position.z - CAMERA_OFFSET.z
      )

      // Apply horizontal rotation
      const horizontalRotation = new Quaternion()
      horizontalRotation.setFromAxisAngle(
        new Vector3(0, 1, 0),
        -deltaX * MOUSE_ROTATION_SPEED
      )
      CAMERA_OFFSET.applyQuaternion(horizontalRotation)

      // Apply vertical rotation (with limits)
      const right = new Vector3(CAMERA_OFFSET.z, 0, -CAMERA_OFFSET.x).normalize()
      const verticalRotation = new Quaternion()
      verticalRotation.setFromAxisAngle(right, -deltaY * MOUSE_ROTATION_SPEED)

      // Calculate new vertical angle after rotation
      const tempOffset = CAMERA_OFFSET.clone().applyQuaternion(verticalRotation)
      const verticalAngle = Math.atan2(tempOffset.y, Math.sqrt(tempOffset.x * tempOffset.x + tempOffset.z * tempOffset.z))

      // Only apply vertical rotation if within limits (20 to 80 degrees)
      if (verticalAngle > Math.PI * 0.11 && verticalAngle < Math.PI * 0.44) {
        CAMERA_OFFSET.copy(tempOffset)
      }

      // Update camera position and look at
      camera.position.copy(targetPosition).add(CAMERA_OFFSET)
      camera.lookAt(targetPosition)
    }

    const handleContextMenu = (event: Event) => {
      event.preventDefault()
    }

    const updatePosition = () => {
      const movement = new Vector3(0, 0, 0)
      
      // Calculate movement in world space
      if (moveState.forward) movement.z -= MOVE_SPEED
      if (moveState.backward) movement.z += MOVE_SPEED
      if (moveState.left) movement.x -= MOVE_SPEED
      if (moveState.right) movement.x += MOVE_SPEED

      // Get current target position (center of view)
      const targetPosition = new Vector3(
        camera.position.x - CAMERA_OFFSET.x,
        TARGET_HEIGHT,
        camera.position.z - CAMERA_OFFSET.z
      )

      // Handle keyboard rotation
      if (moveState.rotateLeft || moveState.rotateRight) {
        const rotationAngle = ROTATION_SPEED * (moveState.rotateLeft ? 1 : -1)
        const rotationQuaternion = new Quaternion()
        rotationQuaternion.setFromAxisAngle(new Vector3(0, 1, 0), rotationAngle)
        CAMERA_OFFSET.applyQuaternion(rotationQuaternion)
      }

      // Apply movement in the camera's rotated space
      movement.applyQuaternion(camera.quaternion)
      targetPosition.add(movement)

      // Update camera position
      camera.position.copy(targetPosition).add(CAMERA_OFFSET)
      camera.lookAt(targetPosition)

      requestAnimationFrame(updatePosition)
    }

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    gl.domElement.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('contextmenu', handleContextMenu)

    const animationId = requestAnimationFrame(updatePosition)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      gl.domElement.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('contextmenu', handleContextMenu)
      cancelAnimationFrame(animationId)
    }
  }, [camera, gl])

  return null
}

export default CameraController 