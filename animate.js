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
  controls,
  nextStep,
  camera2,
  matLine,
  gpuPanel,
  inset,
} from "./main.js";
import { updateWeightSliders, updateCrossFadeControls } from "./utils.js";

export default function animate() {
  // Render loop

  requestAnimationFrame(animate);

  weight.idleWeight = idleAction.getEffectiveWeight();
  weight.glideWeight = glideAction.getEffectiveWeight();
  weight.swimWeight = swimAction.getEffectiveWeight();

  // Update the panel values if weights are modified from "outside" (by crossfadings)

  updateWeightSliders();

  // Enable/disable crossfade controls according to current weight values

  updateCrossFadeControls();

  // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

  let mixerUpdateDelta = clock.getDelta();

  // If in single step mode, make one step and then do nothing (until the user clicks again)

  if (stepMode.singleStepMode) {
    mixerUpdateDelta = nextStep.sizeOfNextStep;
    nextStep.sizeOfNextStep = 0;
  }

  // Update the animation mixer, the stats panel, and render this frame

  mixer.update(mixerUpdateDelta);

  // stats.update();

  // controls.update();
  // renderer.render(scene, camera);

  // start ----------
  // requestAnimationFrame(animate);

  stats.update();

  // main scene

  renderer.setClearColor(0x000000, 0);

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  // renderer will set this eventually
  matLine.resolution.set(window.innerWidth, window.innerHeight); // resolution of the viewport

  gpuPanel.startQuery();
  renderer.render(scene, camera);
  gpuPanel.endQuery();

  // inset scene

  renderer.setClearColor(0x222222, 1);

  renderer.clearDepth();

  renderer.setScissorTest(true);

  renderer.setScissor(
    60,
    inset.insetHeight * 2,
    inset.insetWidth,
    inset.insetHeight
  );

  renderer.setViewport(
    -530,
    inset.insetHeight * 2 - 140,
    inset.insetWidth * 6,
    inset.insetHeight * 6
  );

  camera2.position.copy(camera.position);
  camera2.quaternion.copy(camera.quaternion);

  // renderer will set this eventually
  matLine.resolution.set(inset.insetWidth, inset.insetHeight); // resolution of the inset viewport

  renderer.render(scene, camera2);

  renderer.setScissorTest(false);
}
