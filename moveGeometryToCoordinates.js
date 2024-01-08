import * as THREE from "three";
import {
  pointsPath,
  marineLifeBehaviourData,
  model,
  camera,
  renderer,
  scene,
  gridHelper,
  cameraDistance,
} from "./main.js";

export default function moveGeometryToCoordinates(j) {
  // Function to move the geometry to the specified X, Y, Z coordinates
  let closestPoint, closestPointOnRotatedTrack, rotationMatrix, nextPoint, currentPosition;
  let dampingFactor = 1, desiredCameraPosition;
  
  // Calculate the closest point on the path to the target coordinates
  let fraction = 0;
  while (fraction < 1) {
    closestPointOnRotatedTrack = pointsPath.curves[j].getPointAt(fraction);
    currentPosition = pointsPath.curves[j].getPointAt(fraction + 1); // Adjust the fraction value

    rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2); // Same rotation value
    closestPoint = closestPointOnRotatedTrack.applyMatrix4(rotationMatrix);
    nextPoint = currentPosition.applyMatrix4(rotationMatrix);

    // Apply rotations using quaternions
    let roll = Number(marineLifeBehaviourData[j].roll);
    let pitch = -Number(marineLifeBehaviourData[j].pitch);
    let heading = Number(marineLifeBehaviourData[j].heading);
    
    let quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll); // Roll
    quaternion.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch), quaternion); // Pitch
    quaternion.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), heading), quaternion); // Heading/Yaw

    model.quaternion.copy(quaternion);

    model.position.copy(closestPoint);

    // Update grid's position
    const xOffset = model.position.x - gridHelper.position.x;
    const yOffset = model.position.z - gridHelper.position.z;
    gridHelper.position.set(gridHelper.position.x + xOffset, 0, gridHelper.position.z + yOffset);

    const target = model.position.clone();
    desiredCameraPosition = target.add(new THREE.Vector3(0, 3, cameraDistance));

    // Smoothly interpolate the camera's position
    camera.position.lerp(desiredCameraPosition, dampingFactor);
    camera.lookAt(target);
    renderer.render(scene, camera);

    fraction = fraction + 1;
  }
}
