import {
  idleAction,
  glideAction,
  swimAction,
  settings,
  actions,
  weight,
  crossFadeControls,
  stepMode,
  mixer,
  nextStep,
  model,
  skeleton,
  camera,
  renderer,
  camera2,
  inset,
} from "./main.js";
// import stepMode.singleStepMode from "./main.js";

export function showModel(visibility) {
  model.visible = visibility;
}

export function showSkeleton(visibility) {
  skeleton.visible = visibility;
}

export function modifyTimeScale(speed) {
  mixer.timeScale = speed;
}

export function deactivateAllActions() {
  actions.forEach(function (action) {
    action.stop();
  });
}

export function activateAllActions() {
  setWeight(idleAction, settings["modify idle weight"]);
  setWeight(glideAction, settings["modify glide weight"]);
  setWeight(swimAction, settings["modify swim weight"]);

  actions.forEach(function (action) {
    action.play();
  });
}

export function pauseContinue() {
  if (stepMode.singleStepMode) {
    stepMode.singleStepMode = false;
    unPauseAllActions();
  } else {
    if (idleAction.paused) {
      unPauseAllActions();
    } else {
      pauseAllActions();
    }
  }
}

export function pauseAllActions() {
  actions.forEach(function (action) {
    action.paused = true;
  });
}

export function unPauseAllActions() {
  actions.forEach(function (action) {
    action.paused = false;
  });
}

export function toSingleStepMode() {
  unPauseAllActions();

  stepMode.singleStepMode = true;
  nextStep.sizeOfNextStep = settings["modify step size"];
}

export function prepareCrossFade(startAction, endAction, defaultDuration) {
  // Switch default / custom crossfade duration (according to the user's choice)

  const duration = setCrossFadeDuration(defaultDuration);

  // Make sure that we don't go on in singleStepMode, and that all actions are unpaused
  stepMode.singleStepMode = false;
  unPauseAllActions();

  // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
  // else wait until the current action has finished its current loop

  if (startAction === idleAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction, endAction, duration);
  }
}

export function setCrossFadeDuration(defaultDuration) {
  // Switch default crossfade duration <-> custom crossfade duration

  if (settings["use default duration"]) {
    return defaultDuration;
  } else {
    return settings["set custom duration"];
  }
}

export function synchronizeCrossFade(startAction, endAction, duration) {
  mixer.addEventListener("loop", onLoopFinished);

  function onLoopFinished(event) {
    if (event.action === startAction) {
      mixer.removeEventListener("loop", onLoopFinished);

      executeCrossFade(startAction, endAction, duration);
    }
  }
}

export function executeCrossFade(startAction, endAction, duration) {
  // Not only the start action, but also the end action must get a weight of 1 before fading
  // (concerning the start action this is already guaranteed in this place)

  setWeight(endAction, 1);
  endAction.time = 0;

  // Crossfade with warping - you can also try without warping by setting the third parameter to false

  startAction.crossFadeTo(endAction, duration, true);
}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

export function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

// Called by the render loop

export function updateWeightSliders() {
  settings["modify idle weight"] = weight.idleWeight;
  settings["modify glide weight"] = weight.glideWeight;
  settings["modify swim weight"] = weight.swimWeight;
}

// Called by the render loop

export function updateCrossFadeControls() {
  if (
    weight.idleWeight === 1 &&
    weight.glideWeight === 0 &&
    weight.swimWeight === 0
  ) {
    crossFadeControls[0].disable();
    crossFadeControls[1].enable();
    crossFadeControls[2].disable();
    crossFadeControls[3].disable();
  }

  if (
    weight.idleWeight === 0 &&
    weight.glideWeight === 1 &&
    weight.swimWeight === 0
  ) {
    crossFadeControls[0].enable();
    crossFadeControls[1].disable();
    crossFadeControls[2].enable();
    crossFadeControls[3].disable();
  }

  if (
    weight.idleWeight === 0 &&
    weight.glideWeight === 0 &&
    weight.swimWeight === 1
  ) {
    crossFadeControls[0].disable();
    crossFadeControls[1].disable();
    crossFadeControls[2].disable();
    crossFadeControls[3].enable();
  }
}

export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  inset.insetWidth = window.innerHeight / 3; // square
  inset.insetHeight = window.innerHeight / 3;

  camera2.aspect = inset.insetWidth / inset.insetHeight;
  camera2.updateProjectionMatrix();
}
