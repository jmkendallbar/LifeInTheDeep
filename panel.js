import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {
  deactivateAllActions,
  toSingleStepMode,
  pauseContinue,
  activateAllActions,
  prepareCrossFade,
  setWeight,
  showModel,
  showSkeleton,
  modifyTimeScale,
} from "./utils.js";
import {
  idleAction,
  glideAction,
  swimAction,
  settings,
  crossFadeControls,
} from "./main.js";

export default function createPanel() {
  const panel = new GUI({ width: 310 });

  const folder1 = panel.addFolder("Visibility");
  const folder2 = panel.addFolder("Activation/Deactivation");
  const folder3 = panel.addFolder("Pausing/Stepping");
  const folder4 = panel.addFolder("Crossfading");
  const folder5 = panel.addFolder("Blend Weights");
  const folder6 = panel.addFolder("General Speed");

  settings.setting = {
    "show model": true,
    "show skeleton": false,
    "deactivate all": deactivateAllActions,
    "activate all": activateAllActions,
    "pause/continue": pauseContinue,
    "make single step": toSingleStepMode,
    "modify step size": 0.05,
    "from glide to idle": function () {
      prepareCrossFade(glideAction, idleAction, 1.0);
    },
    "from idle to glide": function () {
      prepareCrossFade(idleAction, glideAction, 0.5);
    },
    "from glide to swim": function () {
      prepareCrossFade(glideAction, swimAction, 2.5);
    },
    "from swim to glide": function () {
      prepareCrossFade(swimAction, glideAction, 5.0);
    },
    "from swim to idle": function () {
      prepareCrossFade(swimAction, idleAction, 5.0);
    },
    "from idle to swim": function () {
      prepareCrossFade(idleAction, swimAction, 5.0);
    },
    "use default duration": true,
    "set custom duration": 3.5,
    "modify idle weight": 0.0,
    "modify glide weight": 1.0,
    "modify swim weight": 0.0,
    "modify time scale": 1.0,
  };

  folder1.add(settings.setting, "show model").onChange(showModel);
  folder1.add(settings.setting, "show skeleton").onChange(showSkeleton);
  folder2.add(settings.setting, "deactivate all");
  folder2.add(settings.setting, "activate all");
  folder3.add(settings.setting, "pause/continue");
  folder3.add(settings.setting, "make single step");
  folder3.add(settings.setting, "modify step size", 0.01, 0.1, 0.001);
  crossFadeControls.push(folder4.add(settings.setting, "from glide to idle"));
  crossFadeControls.push(folder4.add(settings.setting, "from idle to glide"));
  crossFadeControls.push(folder4.add(settings.setting, "from glide to swim"));
  crossFadeControls.push(folder4.add(settings.setting, "from swim to glide"));
  folder4.add(settings.setting, "use default duration");
  folder4.add(settings.setting, "set custom duration", 0, 10, 0.01);
  folder5
    .add(settings.setting, "modify idle weight", 0.0, 1.0, 0.01)
    .listen()
    .onChange(function (weight) {
      setWeight(idleAction, weight);
    });
  folder5
    .add(settings.setting, "modify glide weight", 0.0, 1.0, 0.01)
    .listen()
    .onChange(function (weight) {
      setWeight(glideAction, weight);
    });
  folder5
    .add(settings.setting, "modify swim weight", 0.0, 1.0, 0.01)
    .listen()
    .onChange(function (weight) {
      setWeight(swimAction, weight);
    });
  folder6
    .add(settings.setting, "modify time scale", 0.0, 0.25, 1.5, 0.01, 2.5)
    .onChange(modifyTimeScale);

  panel.close();
  folder1.close();
  folder2.close();
  folder3.close();
  folder4.close();
  folder5.close();
  folder6.close();
}
