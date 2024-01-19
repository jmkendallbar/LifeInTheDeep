import * as THREE from "three";
import {
  pointsPath,
  marineLifeBehaviourData,
  model,
  camera,
  camera2,
  renderer,
  scene,
  gridHelper,
  cameraDistance,
} from "./main.js";

import { addXYToMap } from "./map.js";

export default function moveGeometryToCoordinates(j) {
  addXYToMap(
    marineLifeBehaviourData[j].Long,
    marineLifeBehaviourData[j].Lat
  )
  // Function to move the geometry to the specified X, Y, Z coordinates
  let closestPoint, closestPointOnRotatedTrack, rotationMatrix, nextPoint, currentPosition;
  let dampingFactor = 0.05; // Smaller value for smoother movement
  let movementSpeed = 0.05; // Adjust this value for responsiveness
  
  // Calculate the closest point on the path to the target coordinates
  let fraction = 0;
  while (fraction < 1) {
    closestPointOnRotatedTrack = pointsPath.curves[j].getPointAt(fraction);
    currentPosition = pointsPath.curves[j].getPointAt(fraction + 1); // Adjust the fraction value

    rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    closestPoint = closestPointOnRotatedTrack.applyMatrix4(rotationMatrix);
    nextPoint = currentPosition.applyMatrix4(rotationMatrix);

    // Apply rotations using quaternions
    let roll = Number(marineLifeBehaviourData[j].roll);
    let pitch = -Number(marineLifeBehaviourData[j].pitch);
    let heading = Number(marineLifeBehaviourData[j].heading);
    
    let quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll); // Roll
    quaternion.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch), quaternion); // Pitch

    model.quaternion.copy(quaternion);
    model.position.copy(closestPoint);

    // Update grid's position
    const xOffset = model.position.x - gridHelper.position.x;
    const yOffset = model.position.z - gridHelper.position.z;
    gridHelper.position.set(gridHelper.position.x + xOffset, 0, gridHelper.position.z + yOffset);

    // Calculate the desired camera position
    let targetPosition = model.position.clone().add(new THREE.Vector3(0, 3, cameraDistance));

    // Gradually move the camera towards the target position
    let moveDirection = targetPosition.sub(camera.position);
    let moveDistance = moveDirection.length() * movementSpeed;
    if (moveDistance > 0.001) {
      moveDirection.normalize().multiplyScalar(moveDistance);
      camera.position.add(moveDirection);
    }

    // Ensure the camera is looking at the target
    camera.lookAt(model.position);

    // Update camera2 position and orientation
    let leftOffset = 0; // Distance to the left
    let upOffset = 2; // Distance upward
    let forwardOffset = 10; // Distance in front of the seal

    // Calculate the new position of camera2
    let sealForward = new THREE.Vector3(0, 0, -1);
    sealForward.applyQuaternion(quaternion);
    let sealLeft = new THREE.Vector3(-1, 0, 0);
    sealLeft.applyQuaternion(quaternion);
    let sealUp = new THREE.Vector3(0, 1, 0);

    let camera2Position = closestPoint.clone()
        .add(sealForward.multiplyScalar(-forwardOffset))
        .add(sealLeft.multiplyScalar(leftOffset))
        .add(sealUp.multiplyScalar(upOffset));

    camera2.position.copy(camera2Position);
    camera2.lookAt(closestPoint);

    renderer.render(scene, camera);

    fraction = fraction + 1;
  }
}
