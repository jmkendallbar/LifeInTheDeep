import * as THREE from "three";
import {
  pointsPath,
  sealBehaviourData,
  model,
  camera,
  renderer,
  scene,
  gridHelper,
  cameraDistance,
  page,
  perPage,
} from "./main.js";

export default function moveGeometryToCoordinates(j) {
  // Function to move the geometry to the specified X, Y, Z coordinates
  let closestPoint,
    closestPointOnRotatedTrack,
    rotationMatrix,
    nextPoint,
    currentPosition;
  let dampingFactor = 1,
    desiredCameraPosition;
  // Calculate the closest point on the path to the target coordinates
  let fraction = 0;
  while (fraction < 1) {
    const skip = page * perPage;
    // console.log("skip", pointsPath.curves[j], pointsPath.curves[0]);
    closestPointOnRotatedTrack = pointsPath.curves[j].getPointAt(fraction);
    currentPosition = pointsPath.curves[j].getPointAt(fraction + 1); // You can adjust the fraction value
    rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2); // Use the same rotation value
    closestPoint = closestPointOnRotatedTrack.applyMatrix4(rotationMatrix);

    nextPoint = currentPosition.applyMatrix4(rotationMatrix);
    model.rotation.x = Number(sealBehaviourData[j - (skip + page)].pitch);
    model.rotation.z = Number(sealBehaviourData[j - (skip + page)].roll);
    model.rotation.y = Number(sealBehaviourData[j - (skip + page)].heading);
    // model.lookAt(nextPoint);
    model.position.copy(closestPoint);

    // Update the grid's position to be parallel to the moving object
    const xOffset = model.position.x - gridHelper.position.x;
    const yOffset = model.position.z - gridHelper.position.z;
    // const zOffset = model.position.y - gridHelper.position.y;
    gridHelper.position.set(
      gridHelper.position.x + xOffset,
      0,
      gridHelper.position.z + yOffset
    );

    const target = model.position.clone();

    desiredCameraPosition = target.add(new THREE.Vector3(0, 3, cameraDistance));

    // Smoothly interpolate the camera's position towards the desired position
    camera.position.lerp(desiredCameraPosition, dampingFactor);
    camera.lookAt(target);
    renderer.render(scene, camera);
    fraction = fraction + 1;
  }
}
