import * as THREE from "three";
import "./main.css";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initializeSpectrogram } from './js/spectrogram.js'
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// importing seal.json data file.
import seal from "./data/Minimized_data.json";

// declaring variables
let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;
let controls;

const crossFadeControls = [];

let idleAction, glideAction, swimAction;
let idleWeight, glideWeight, swimWeight;
let actions, settings;
let isStart = true;
let sealBehaviourData = [];
let length = 0;
let lastIndex;
// let prevValue;

let singleStepMode = false;
let sizeOfNextStep = 0;
let playSpeed = 300;
let initialSeconds;
let frequency;
let minStroke, maxStroke;
let prevValue;

// This is the intializing function when the website will load first
init();

// start init function
function init() {
  // Display chart using Plotly --start
  initialSeconds = seal[0].Seconds;
  frequency = seal[1].Seconds - seal[0].Seconds;
  seal.forEach((item) => {
    sealBehaviourData[item.Seconds - initialSeconds] = item;
  });

  length = (sealBehaviourData.length - 1) / frequency;
  lastIndex = length * frequency;

  const xArray = sealBehaviourData.map((item) => {
    return item.Seconds / 60;
  });
  const yArray = sealBehaviourData.map((item) => {
    return item.Stroke_Rate;
  });

  minStroke = sealBehaviourData.reduce(function (prev, curr) {
    return prev.Stroke_Rate < curr.Stroke_Rate ? prev : curr;
  });

  maxStroke = sealBehaviourData.reduce(function (prev, curr) {
    return prev.Stroke_Rate > curr.Stroke_Rate ? prev : curr;
  });

  // Define Data
  // const data = [
  //   {
  //     x: xArray,
  //     y: yArray,
  //     mode: "markers",
  //   },
  // ];

  // Define Layout
  // const layout = {
  //   xaxis: {
  //     range: [
  //       sealBehaviourData[0].Seconds / 60,
  //       sealBehaviourData[lastIndex].Seconds / 60,
  //     ],
  //     title: "Time [min of dive]",
  //   },
  //   yaxis: {
  //     range: [minStroke.Stroke_Rate, maxStroke.Stroke_Rate],
  //     title: "Stroke rate (spm)",
  //   },
};

// Plotly.newPlot("chartDiv", data, layout);
initializeSpectrogram(seal)
// plotly chart --end

// this is the container div where we are showing the overall UI video.
const container = document.getElementById("container");

// creating instance for camera, clock and scene.
camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(5, 1, 1);
camera.lookAt(0, 1, 0);

clock = new THREE.Clock();

scene = new THREE.Scene();
scene.background = new THREE.Color(0x33567d);
scene.fog = new THREE.Fog(0x33567d, 10, 50);

const hemiLight = new THREE.HemisphereLight(0x33567d, 0x33567d, 3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0x33567d, 3);
dirLight.position.set(-3, 10, -10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = -2;
dirLight.shadow.camera.left = -2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

// ground

const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);

// creating instance for loader which is use to load our model
const loader = new GLTFLoader();
loader.load(
  "https://visualising-life-in-the-deep.s3.amazonaws.com/Seal_Animation.glb",
  function (gltf) {
    model = gltf.scene;
    scene.add(model);

    model.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });

    //

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton);

    createPanel();

    const animations = gltf.animations;

    mixer = new THREE.AnimationMixer(model);

    // once the model is loaded then we are picking the animations from the model like idle, gliding and swimming. 6, 28 and 15 is the index for that animation
    idleAction = mixer.clipAction(animations[6]);
    glideAction = mixer.clipAction(animations[28]);
    swimAction = mixer.clipAction(animations[15]);

    actions = [idleAction, glideAction, swimAction];

    activateAllActions();

    animate();

    // Declaring the varaibles for UI component like button, rangeSlider and more.
    let timer;
    let isTimerStop = true;
    let rangeSlider = document.createElement("input");
    let pauseBtn = document.getElementById("pause-icon");
    let cropBtn = document.getElementById("crop-icon");
    let playBtn = document.getElementById("play-icon");
    let resetBtn = document.getElementById("reset-icon");
    let strokeEle = document.createElement("span");
    let strokeInnerText = document.createElement("span");
    let heartEle = document.createElement("span");
    let heartInnerText = document.createElement("span");
    let minuteEle = document.createElement("span");
    let depthEle = document.createElement("span");
    let stateEle = document.createElement("span");
    let playSpeedBtn = document.createElement("button");
    let confirmDuration = document.getElementById("confirmClip");

    // timeline crop video's code start from here
    cropBtn.id = "cropBtnId";
    cropBtn.style.cursor = "pointer";

    // Get the modal
    var modal = document.getElementById("myModal");

    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal
    cropBtn.onclick = function () {
      modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };

    let sliderOne = document.getElementById("slider-1");
    let sliderTwo = document.getElementById("slider-2");
    let displayValOne = document.getElementById("range1");
    let displayValTwo = document.getElementById("range2");
    let minGap = 0;
    let sliderTrack = document.querySelector(".slider-track");
    let sliderMaxValue = document.getElementById("slider-1").max;
    sliderOne.min = sealBehaviourData[0].Seconds;
    sliderOne.value = sealBehaviourData[0].Seconds;
    sliderOne.max = sealBehaviourData[length - 1].Seconds;
    sliderTwo.min = sealBehaviourData[0].Seconds + 1;
    sliderTwo.max = sealBehaviourData[length].Seconds;
    sliderTwo.value = sealBehaviourData[length].Seconds;

    // DUAL RANGE SLIDER
    function slideOne() {
      if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
      }
      displayValOne.textContent =
        (sliderOne.value / 60 - sealBehaviourData[0].Seconds / 60).toFixed(
          0
        ) + " min";
      fillColor();
    }
    function slideTwo() {
      if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
      }
      displayValTwo.textContent =
        (sliderTwo.value / 60 - sliderOne.value / 60).toFixed(0) + " min";
      fillColor();
    }
    function fillColor() {
      let percent1 = (sliderOne.value / sliderMaxValue) * 100;
      let percent2 = (sliderTwo.value / sliderMaxValue) * 100;
      sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
    }

    sliderOne.oninput = function () {
      slideOne();
    };

    sliderTwo.oninput = function () {
      slideTwo();
    };

    // calling sliderOne and SliderTwo
    slideOne();
    slideTwo();

    // timeline crop video code --end

    // stroke span
    strokeEle.textContent = "STROKE RATE";
    strokeEle.style.position = "absolute";
    strokeEle.style.bottom = "200px";
    strokeEle.style.right = "60px";
    strokeEle.style.color = "#fff";
    strokeEle.style.fontFamily = "system-ui";
    strokeEle.style.fontSize = "28px";

    // stroke data
    strokeInnerText.textContent = "0 spm";
    strokeInnerText.style.position = "absolute";
    strokeInnerText.style.bottom = "166px";
    strokeInnerText.style.right = "60px";
    strokeInnerText.style.color = "#fff";
    strokeInnerText.style.fontSize = "32px";
    strokeInnerText.style.fontFamily = "system-ui";

    // heart span
    heartEle.textContent = "HEART RATE";
    heartEle.style.position = "absolute";
    heartEle.style.bottom = "126px";
    heartEle.style.right = "60px";
    heartEle.style.fontSize = "28px";
    heartEle.style.color = "#fff";
    heartEle.style.fontFamily = "system-ui";

    // heart data
    heartInnerText.textContent = "36 bpm";
    heartInnerText.style.position = "absolute";
    heartInnerText.style.color = "#fff";
    heartInnerText.style.bottom = "90px";
    heartInnerText.style.right = "60px";
    heartInnerText.style.fontSize = "32px";
    heartInnerText.style.fontFamily = "system-ui";

    // range slider
    rangeSlider.setAttribute("type", "range");
    rangeSlider.id = "slider-range";
    rangeSlider.min = sealBehaviourData[0].Seconds - initialSeconds;
    rangeSlider.max = length;
    rangeSlider.defaultValue = sealBehaviourData[0].Seconds - initialSeconds;
    rangeSlider.style.position = "absolute";
    rangeSlider.style.width = "90%";
    rangeSlider.style.bottom = "60px";
    rangeSlider.style.left = "60px";
    rangeSlider.style.height = "20px";
    rangeSlider.style.cursor = "pointer";

    // pause button
    pauseBtn.style.cursor = "pointer";
    pauseBtn.onclick = function () {
      if (isTimerStop) {
        clearInterval(timer);
        pauseContinue();
        isTimerStop = false;
        pauseBtn.style.display = "none";
        playBtn.style.display = "block";
      }
    };

    // play button
    playBtn.style.cursor = "pointer";
    playBtn.onclick = function () {
      if (!isTimerStop) {
        intervalFunction();
        pauseContinue();
        isTimerStop = true;
        pauseBtn.style.display = "block";
        playBtn.style.display = "none";
      }
    };

    // reset button
    resetBtn.style.cursor = "pointer";
    resetBtn.onclick = function () {
      rangeSlider.value = rangeSlider.min;
    };

    // confirm video crop btn / function
    confirmDuration.style.color = "#000";
    confirmDuration.style.width = "100px";
    confirmDuration.style.height = "40px";
    confirmDuration.style.border = "1px solid #fff";
    confirmDuration.style.borderRadius = "8px";
    confirmDuration.style.cursor = "pointer";
    confirmDuration.style.fontWeight = "600";
    confirmDuration.style.color = "#fff";
    confirmDuration.style.backgroundColor = "#3264FE";
    confirmDuration.onclick = function () {
      clearInterval(timer);
      if (playBtn.style.display === "block") {
        pauseContinue();
        isTimerStop = true;
        pauseBtn.style.display = "block";
        playBtn.style.display = "none";
      }
      let xArray1 = sealBehaviourData.filter((item) => {
        if (
          sliderOne.value <= item.Seconds &&
          sliderTwo.value >= item.Seconds
        ) {
          return item;
        }
      });

      // initialSeconds = xArray1[0].Seconds;
      let startIndex = sealBehaviourData
        .map((item) => {
          if (sliderOne.value === item.Seconds.toString()) {
            return item.Seconds;
          }
        })
        .indexOf(Number(sliderOne.value));
      let endIndex = sealBehaviourData
        .map((item) => {
          if (sliderTwo.value === item.Seconds.toString()) {
            return item.Seconds;
          }
        })
        .indexOf(Number(sliderTwo.value));
      length = (xArray1.length - 1) / frequency;
      rangeSlider.min = startIndex;
      rangeSlider.value = startIndex;
      rangeSlider.defaultValue = startIndex;
      rangeSlider.max = endIndex;
      modal.style.display = "none";

      // after loaded and data this function will call
      intervalFunction();

      // let data1 = [
      //   {
      //     x: xArray1,
      //     y: xArray1,
      //     mode: "markers",
      //   },
      // ];

      // minStroke = xArray1.reduce(function (prev, curr) {
      //   return prev.Stroke_Rate < curr.Stroke_Rate ? prev : curr;
      // });

      // maxStroke = xArray1.reduce(function (prev, curr) {
      //   return prev.Stroke_Rate > curr.Stroke_Rate ? prev : curr;
      // });

      // Define Layout
      // let layout1 = {
      //   xaxis: {
      //     range: [
      //       xArray1[0].Seconds / 60,
      //       xArray1[xArray1.length - 1].Seconds / 60,
      //     ],
      //     title: "Time [min of dive]",
      //   },
      //   yaxis: {
      //     range: [minStroke.Stroke_Rate, maxStroke.Stroke_Rate],
      //     title: "Stroke rate (spm)",
      //   },
      // };
      initializeSpectrogram(seal)
      // Plotly.update("chartDiv", data1, layout1);
    };

    // MINUTE ELEMENT
    minuteEle.textContent = "MINUTES INTO DIVE";
    minuteEle.style.position = "absolute";
    minuteEle.style.width = "160px";
    minuteEle.style.bottom = "110px";
    minuteEle.style.left = "60px";
    minuteEle.style.color = "#fff";
    minuteEle.style.fontSize = "28px";
    minuteEle.style.fontFamily = "system-ui";

    // DEPTH ELEMENT
    depthEle.textContent = "DEPTH 196m";
    depthEle.style.width = "100px";
    depthEle.style.position = "absolute";
    depthEle.style.bottom = "400px";
    depthEle.style.right = "60px";
    depthEle.style.color = "#fff";
    depthEle.style.fontSize = "32px";
    depthEle.style.fontFamily = "system-ui";

    // State ELEMENT
    stateEle.textContent = "SLEEP STATE ACTIVE WAKING";
    stateEle.style.width = "170px";
    stateEle.style.position = "absolute";
    stateEle.style.textAlign = "center";
    stateEle.style.top = "238px";
    stateEle.style.left = "60px";
    stateEle.style.color = "#fff";
    stateEle.style.fontSize = "20px";
    stateEle.style.fontFamily = "system-ui";
    stateEle.style.backgroundColor = "#4f7942";
    stateEle.style.borderRadius = "46px";
    stateEle.style.paddingTop = "16px";
    stateEle.style.paddingBottom = "16px";
    stateEle.style.paddingLeft = "30px";
    stateEle.style.paddingRight = "30px";
    stateEle.style.border = "4px solid #fff";

    // play speed button
    playSpeedBtn.type = "button";
    playSpeedBtn.innerText = "1x";
    playSpeedBtn.style.position = "absolute";
    playSpeedBtn.style.width = "60px";
    playSpeedBtn.style.height = "30px";
    playSpeedBtn.style.borderRadius = "8px";
    playSpeedBtn.style.bottom = "16px";
    playSpeedBtn.style.left = "160px";
    playSpeedBtn.style.color = "#fff";
    playSpeedBtn.style.color = "#000";
    playSpeedBtn.style.cursor = "pointer";
    playSpeedBtn.style.fontFamily = "system-ui";
    playSpeedBtn.style.border = "1px solid #fff";
    playSpeedBtn.onclick = function () {
      if (playSpeed === 300) {
        playSpeed = 150;
        playSpeedBtn.innerText = "2x";
        clearInterval(timer);
        intervalFunction();
        modifyTimeScale(1.5);
      } else if (playSpeed === 150) {
        playSpeed = 75;
        playSpeedBtn.innerText = "3x";
        clearInterval(timer);
        intervalFunction();
        modifyTimeScale(2.5);
      } else if (playSpeed === 75) {
        playSpeed = 900;
        playSpeedBtn.innerText = "0.25x";
        clearInterval(timer);
        intervalFunction();
        modifyTimeScale(0.25);
      } else if (playSpeed === 900) {
        playSpeed = 600;
        playSpeedBtn.innerText = "0.5x";
        clearInterval(timer);
        intervalFunction();
        modifyTimeScale(0.5);
      } else {
        playSpeed = 300;
        playSpeedBtn.innerText = "1x";
        clearInterval(timer);
        intervalFunction();
        modifyTimeScale(1.0);
      }
    };

    // Appending the child into the DOM
    document.body.appendChild(strokeEle);
    document.body.appendChild(strokeInnerText);
    document.body.appendChild(heartEle);
    document.body.appendChild(heartInnerText);
    document.body.appendChild(rangeSlider);
    document.body.appendChild(pauseBtn);
    document.body.appendChild(playBtn);
    document.body.appendChild(resetBtn);
    document.body.appendChild(minuteEle);
    document.body.appendChild(stateEle);
    document.body.appendChild(depthEle);
    document.body.appendChild(playSpeedBtn);
    document.body.appendChild(cropBtn);
    // document.body.appendChild(depthEle);
    //  End

    // Slider logic start from here
    prevValue = sealBehaviourData[0].Seconds - initialSeconds;
    rangeSlider.onclick = function () {
      clearInterval(timer);
      intervalFunction();

      if (!isTimerStop) {
        isTimerStop = true;
        pauseContinue();
        pauseBtn.style.display = "block";
        playBtn.style.display = "none";
      }
    };
    intervalFunction();

    String.prototype.toHHMMSS = function () {
      var sec_num = parseInt(this, 10); // don't forget the second param
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - hours * 3600) / 60);
      var seconds = sec_num - hours * 3600 - minutes * 60;

      if (hours < 10) {
        hours = "0" + hours;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      return hours + ":" + minutes + ":" + seconds;
    };

    // This is the main function which takes the current status from the data and based on that showing the model behaviour in the UI screen like swim, glide and idle
    function currentStatus() {
      const currentState =
        sealBehaviourData[Number(rangeSlider.value) * Number(frequency)];
      const prevState =
        sealBehaviourData[Number(prevValue) * Number(frequency)];
      stateEle.innerText = currentState?.Simple_Sleep_Code;
      heartInnerText.innerText = `${currentState.Heart_Rate?.toFixed(2)}bpm`;
      strokeInnerText.innerText = `${currentState.Stroke_Rate?.toFixed(
        2
      )}spm`;
      minuteEle.innerText = `MINUTES INTO DIVE ${currentState.Seconds.toString().toHHMMSS()}`;
      depthEle.innerText = `DEPTH ${currentState["Depth"]?.toFixed(2)}m`;
      if (!isStart) {
        if (currentState.Simple_Sleep_Code === "REM") {
          if (
            prevState.Simple_Sleep_Code === "SWS" ||
            prevState.Simple_Sleep_Code === "Quiet Waking"
          ) {
            prepareCrossFade(glideAction, idleAction, 1.0);
          } else if (prevState.Simple_Sleep_Code === "Active Waking") {
            prepareCrossFade(swimAction, idleAction, 1.0);
          }
        }
        if (
          currentState.Simple_Sleep_Code === "SWS" ||
          currentState.Simple_Sleep_Code === "Quiet Waking"
        ) {
          if (prevState.Simple_Sleep_Code === "REM") {
            prepareCrossFade(idleAction, glideAction, 1.0);
          } else if (prevState.Simple_Sleep_Code === "Active Waking") {
            prepareCrossFade(swimAction, glideAction, 1.0);
          }
        }
        if (currentState.Simple_Sleep_Code === "Active Waking") {
          if (prevState.Simple_Sleep_Code === "REM") {
            prepareCrossFade(idleAction, swimAction, 1.0);
          } else if (
            prevState.Simple_Sleep_Code === "SWS" ||
            prevState.Simple_Sleep_Code === "Quiet Waking"
          ) {
            prepareCrossFade(glideAction, swimAction, 1.0);
          }
        }
      } else if (isStart) {
        if (currentState.Simple_Sleep_Code === "Active Waking") {
          prepareCrossFade(glideAction, swimAction, 1.0);
        } else if (currentState.Simple_Sleep_Code === "REM") {
          prepareCrossFade(glideAction, idleAction, 1.0);
        }
        isStart = false;
      }
      prevValue = rangeSlider.value;
    }

    function intervalFunction() {
      timer = setInterval(() => {
        if (Number(rangeSlider.value) < Number(rangeSlider.max)) {
          rangeSlider.value = rangeSlider.value * 1 + 1;
          currentStatus();
        } else {
          clearInterval(timer);
          pauseContinue();
          isTimerStop = false;
          pauseBtn.style.display = "none";
          playBtn.style.display = "block";
        }
      }, [playSpeed]);
    }
    // end --------------------
  }
);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.useLegacyLights = false;
container.appendChild(renderer.domElement);

stats = new Stats();
container.appendChild(stats.dom);

window.addEventListener("resize", onWindowResize);

controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// JS Charting
// }
// end init function

// creating UI panel model where the user can control's the seal behaviour
function createPanel() {
  const panel = new GUI({ width: 310 });

  const folder1 = panel.addFolder("Visibility");
  const folder2 = panel.addFolder("Activation/Deactivation");
  const folder3 = panel.addFolder("Pausing/Stepping");
  const folder4 = panel.addFolder("Crossfading");
  const folder5 = panel.addFolder("Blend Weights");
  const folder6 = panel.addFolder("General Speed");

  settings = {
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

  folder1.add(settings, "show model").onChange(showModel);
  folder1.add(settings, "show skeleton").onChange(showSkeleton);
  folder2.add(settings, "deactivate all");
  folder2.add(settings, "activate all");
  folder3.add(settings, "pause/continue");
  folder3.add(settings, "make single step");
  folder3.add(settings, "modify step size", 0.01, 0.1, 0.001);
  crossFadeControls.push(folder4.add(settings, "from glide to idle"));
  crossFadeControls.push(folder4.add(settings, "from idle to glide"));
  crossFadeControls.push(folder4.add(settings, "from glide to swim"));
  crossFadeControls.push(folder4.add(settings, "from swim to glide"));
  folder4.add(settings, "use default duration");
  folder4.add(settings, "set custom duration", 0, 10, 0.01);
  folder5
    .add(settings, "modify idle weight", 0.0, 1.0, 0.01)
    .listen()
    .onChange(function (weight) {
      setWeight(idleAction, weight);
    });
  folder5
    .add(settings, "modify glide weight", 0.0, 1.0, 0.01)
    .listen()
    .onChange(function (weight) {
      setWeight(glideAction, weight);
    });
  folder5
    .add(settings, "modify swim weight", 0.0, 1.0, 0.01)
    .listen()
    .onChange(function (weight) {
      setWeight(swimAction, weight);
    });
  folder6
    .add(settings, "modify time scale", 0.0, 0.25, 1.5, 0.01, 2.5)
    .onChange(modifyTimeScale);

  panel.close();
  folder1.close();
  folder2.close();
  folder3.close();
  folder4.close();
  folder5.close();
  folder6.close();
}

function showModel() {
  model.visible = visibility;
}

function showSkeleton(visibility) {
  skeleton.visible = visibility;
}

function modifyTimeScale(speed) {
  mixer.timeScale = speed;
}

function deactivateAllActions() {
  actions.forEach(function (action) {
    action.stop();
  });
}

function activateAllActions() {
  setWeight(idleAction, settings["modify idle weight"]);
  setWeight(glideAction, settings["modify glide weight"]);
  setWeight(swimAction, settings["modify swim weight"]);

  actions.forEach(function (action) {
    action.play();
  });
}

function pauseContinue() {
  if (singleStepMode) {
    singleStepMode = false;
    unPauseAllActions();
  } else {
    if (idleAction.paused) {
      unPauseAllActions();
    } else {
      pauseAllActions();
    }
  }
}

function pauseAllActions() {
  actions.forEach(function (action) {
    action.paused = true;
  });
}

function unPauseAllActions() {
  actions.forEach(function (action) {
    action.paused = false;
  });
}

function toSingleStepMode() {
  unPauseAllActions();

  singleStepMode = true;
  sizeOfNextStep = settings["modify step size"];
}

function prepareCrossFade(startAction, endAction, defaultDuration) {
  // Switch default / custom crossfade duration (according to the user's choice)

  const duration = setCrossFadeDuration(defaultDuration);

  // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

  singleStepMode = false;
  unPauseAllActions();

  // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
  // else wait until the current action has finished its current loop

  if (startAction === idleAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction, endAction, duration);
  }
}

function setCrossFadeDuration(defaultDuration) {
  // Switch default crossfade duration <-> custom crossfade duration

  if (settings["use default duration"]) {
    return defaultDuration;
  } else {
    return settings["set custom duration"];
  }
}

function synchronizeCrossFade(startAction, endAction, duration) {
  mixer.addEventListener("loop", onLoopFinished);

  function onLoopFinished(event) {
    if (event.action === startAction) {
      mixer.removeEventListener("loop", onLoopFinished);

      executeCrossFade(startAction, endAction, duration);
    }
  }
}

function executeCrossFade(startAction, endAction, duration) {
  // Not only the start action, but also the end action must get a weight of 1 before fading
  // (concerning the start action this is already guaranteed in this place)

  setWeight(endAction, 1);
  endAction.time = 0;

  // Crossfade with warping - you can also try without warping by setting the third parameter to false

  startAction.crossFadeTo(endAction, duration, true);
}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

// Called by the render loop

function updateWeightSliders() {
  settings["modify idle weight"] = idleWeight;
  settings["modify glide weight"] = glideWeight;
  settings["modify swim weight"] = swimWeight;
}

// Called by the render loop

function updateCrossFadeControls() {
  if (idleWeight === 1 && glideWeight === 0 && swimWeight === 0) {
    crossFadeControls[0].disable();
    crossFadeControls[1].enable();
    crossFadeControls[2].disable();
    crossFadeControls[3].disable();
  }

  if (idleWeight === 0 && glideWeight === 1 && swimWeight === 0) {
    crossFadeControls[0].enable();
    crossFadeControls[1].disable();
    crossFadeControls[2].enable();
    crossFadeControls[3].disable();
  }

  if (idleWeight === 0 && glideWeight === 0 && swimWeight === 1) {
    crossFadeControls[0].disable();
    crossFadeControls[1].disable();
    crossFadeControls[2].disable();
    crossFadeControls[3].enable();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  // Render loop

  requestAnimationFrame(animate);

  idleWeight = idleAction.getEffectiveWeight();
  glideWeight = glideAction.getEffectiveWeight();
  swimWeight = swimAction.getEffectiveWeight();

  // Update the panel values if weights are modified from "outside" (by crossfadings)

  updateWeightSliders();

  // Enable/disable crossfade controls according to current weight values

  updateCrossFadeControls();

  // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

  let mixerUpdateDelta = clock.getDelta();

  // If in single step mode, make one step and then do nothing (until the user clicks again)

  if (singleStepMode) {
    mixerUpdateDelta = sizeOfNextStep;
    sizeOfNextStep = 0;
  }

  // Update the animation mixer, the stats panel, and render this frame

  mixer.update(mixerUpdateDelta);

  stats.update();

  controls.update();
  renderer.render(scene, camera);
}
