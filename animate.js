import {
  idleAction,
  glideAction,
  swimAction,
  stepMode,
  weight,
  clock,
  mixer,
  scene,
  renderer,
  camera,
  stats,
  nextStep,
  camera2,
  matLine,
  gpuPanel,
  inset,
} from "./main.js";
import { updateWeightSliders, updateCrossFadeControls } from "./utils.js";

export default function animate() {
  requestAnimationFrame(animate);

  // Update weights and crossfade controls
  weight.idleWeight = idleAction.getEffectiveWeight();
  weight.glideWeight = glideAction.getEffectiveWeight();
  weight.swimWeight = swimAction.getEffectiveWeight();
  updateWeightSliders();
  updateCrossFadeControls();

  // Update the mixer
  let mixerUpdateDelta = stepMode.singleStepMode ? nextStep.sizeOfNextStep : clock.getDelta();
  if (stepMode.singleStepMode) {
    nextStep.sizeOfNextStep = 0;
  }
  mixer.update(mixerUpdateDelta);

  // Render the main scene
  renderer.setClearColor(0x000000, 0); // Clear color for main view
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  matLine.resolution.set(window.innerWidth, window.innerHeight); // Set resolution
  gpuPanel.startQuery();
  renderer.render(scene, camera); // Render with main camera
  gpuPanel.endQuery();

  // Render the inset scene
  renderer.setClearColor(0x222222, 1);
  renderer.clearDepth(); // Clear depth to ensure camera2's view isn't blocked

  // Define the size and position of the inset for camera2
  const insetWidth = 300; // Width of camera2 viewport
  const insetHeight = 250; // Height of camera2 viewport
  renderer.setScissorTest(true);
  renderer.setScissor(0, window.innerHeight - insetHeight, insetWidth, insetHeight);
  renderer.setViewport(0, window.innerHeight - insetHeight, insetWidth, insetHeight);

  // Update camera2's position and orientation if needed

  // Render the scene with camera2
  renderer.render(scene, camera2);

  // Reset scissor test
  renderer.setScissorTest(false);

  stats.update(); // Update stats if needed
}
