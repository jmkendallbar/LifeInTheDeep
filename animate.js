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

  stats.update();

  controls.update();
  renderer.render(scene, camera);
}
