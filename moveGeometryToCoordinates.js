import * as THREE from "three";
import {
  pointsPath,
  sealBehaviourData,
  model,
  camera,
  renderer,
  scene,
} from "./main.js";

export default function moveGeometryToCoordinates(j) {
  // Function to move the geometry to the specified X, Y, Z coordinates
  let closestPoint,
    closestPointOnRotatedTrack,
    rotationMatrix,
    nextPoint,
    currentPosition;
  let dampingFactor = 1,
    desiredCameraPosition,
    cameraDistance = 25; // Adjust the distance as needed
  // Calculate the closest point on the path to the target coordinates
  let fraction = 0;
  while (fraction < 1) {
    closestPointOnRotatedTrack = pointsPath.curves[j].getPointAt(fraction);
    currentPosition = pointsPath.curves[j].getPointAt(fraction + 1); // You can adjust the fraction value
    rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2); // Use the same rotation value
    closestPoint = closestPointOnRotatedTrack.applyMatrix4(rotationMatrix);

    nextPoint = currentPosition.applyMatrix4(rotationMatrix);
    model.rotation.x = Number(sealBehaviourData[j].pitch);
    model.rotation.z = Number(sealBehaviourData[j].roll);
    model.rotation.y = Number(sealBehaviourData[j].heading);
    // model.lookAt(nextPoint);
    model.position.copy(closestPoint);

    const target = model.position.clone();

    desiredCameraPosition = target.add(new THREE.Vector3(0, 3, cameraDistance));

    // Smoothly interpolate the camera's position towards the desired position
    camera.position.lerp(desiredCameraPosition, dampingFactor);
    camera.lookAt(target);
    renderer.render(scene, camera);
    fraction = fraction + 1;
  }
}
