import * as THREE from "three";
import "./main.css";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import createPanel from "./panel";
// utils.js
import {
  onWindowResize,
  modifyTimeScale,
  activateAllActions,
  pauseContinue,
  prepareCrossFade,
} from "./utils.js";
import animate from "./animate";
import drawGraph from "./graph";
import elementStyle from "./elementStyle";
// import seal from "./data/Minimized_data.json";
import seal from "./seal-info/batch_3.json";
import appendElement from "./appendElement";

// declaring variables
export let scene, renderer, camera, stats, model;
export let controls;
export let skeleton, mixer, clock;
export let crossFadeControls = [];
export let idleAction, glideAction, swimAction;
export let idleWeight, glideWeight, swimWeight;
export let actions;
export const nextStep = { sizeOfNextStep: 0 };
export const settings = {
  setting: {},
};
export const stepMode = {
  singleStepMode: false,
};
export const weight = {
  idleWeight: 0,
  glideWeight: 0,
  swimWeight: 0,
};
let isStart = true;
export let sealBehaviourData = [];
let length = 0;
export let lastIndex;
// let prevValue;

let playSpeed = 300;
let initialSeconds;
let frequency;
let minStroke, maxStroke;
let prevValue;
// Element Variables
export let rangeSlider,
  strokeEle,
  strokeInnerText,
  heartEle,
  heartInnerText,
  minuteEle,
  depthEle,
  stateEle,
  playSpeedBtn,
  confirmDuration,
  pauseBtn,
  cropBtn,
  playBtn,
  resetBtn;

// This is the intializing function when the website will load first
init();

// start init function
function init() {
  // Display chart using Plotly --start
  initialSeconds = Number(seal[0].Seconds);
  frequency = Number(seal[1].Seconds) - Number(seal[0].Seconds);
  seal.forEach((item) => {
    sealBehaviourData[Number(item.Seconds) - initialSeconds] = item;
  });

  length = (sealBehaviourData.length - 1) / frequency;
  lastIndex = length * frequency;

  const xArray = sealBehaviourData.map((item) => {
    return Number(item.Seconds) / 60;
  });
  const yArray = sealBehaviourData.map((item) => {
    return Number(item.Stroke_Rate);
  });

  minStroke = sealBehaviourData.reduce(function (prev, curr) {
    return Number(prev.Stroke_Rate) < Number(curr.Stroke_Rate) ? prev : curr;
  });

  maxStroke = sealBehaviourData.reduce(function (prev, curr) {
    return Number(prev.Stroke_Rate) > Number(curr.Stroke_Rate) ? prev : curr;
  });

  const plotData = drawGraph(
    xArray,
    yArray,
    minStroke,
    maxStroke,
    lastIndex,
    sealBehaviourData
  );

  Plotly.newPlot("chartDiv", plotData.data, plotData.layout);
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
      rangeSlider = document.createElement("input");
      pauseBtn = document.getElementById("pause-icon");
      cropBtn = document.getElementById("crop-icon");
      playBtn = document.getElementById("play-icon");
      resetBtn = document.getElementById("reset-icon");
      strokeEle = document.createElement("span");
      strokeInnerText = document.createElement("span");
      heartEle = document.createElement("span");
      heartInnerText = document.createElement("span");
      minuteEle = document.createElement("span");
      depthEle = document.createElement("span");
      stateEle = document.createElement("span");
      playSpeedBtn = document.createElement("button");
      confirmDuration = document.getElementById("confirmClip");

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
      sliderOne.min = Number(sealBehaviourData[0].Seconds);
      sliderOne.value = Number(sealBehaviourData[0].Seconds);
      sliderOne.max = Number(sealBehaviourData[length - 1].Seconds);
      sliderTwo.min = Number(sealBehaviourData[0].Seconds) + 1;
      sliderTwo.max = Number(sealBehaviourData[length].Seconds);
      sliderTwo.value = Number(sealBehaviourData[length].Seconds);

      // DUAL RANGE SLIDER
      function slideOne() {
        if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
          sliderOne.value = parseInt(sliderTwo.value) - minGap;
        }
        displayValOne.textContent =
          (
            sliderOne.value / 60 -
            Number(sealBehaviourData[0].Seconds) / 60
          ).toFixed(0) + " min";
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

      elementStyle();

      // range slider
      rangeSlider.min = Number(sealBehaviourData[0].Seconds) - initialSeconds;
      rangeSlider.max = length;
      rangeSlider.defaultValue =
        Number(sealBehaviourData[0].Seconds) - initialSeconds;

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
            sliderOne.value <= Number(item.Seconds) &&
            sliderTwo.value >= Number(item.Seconds)
          ) {
            return item;
          }
        });

        // initialSeconds = xArray1[0].Seconds;
        let startIndex = sealBehaviourData
          .map((item) => {
            if (sliderOne.value === item.Seconds.toString()) {
              return Number(item.Seconds);
            }
          })
          .indexOf(Number(sliderOne.value));
        let endIndex = sealBehaviourData
          .map((item) => {
            if (sliderTwo.value === item.Seconds.toString()) {
              return Number(item.Seconds);
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

        minStroke = xArray1.reduce(function (prev, curr) {
          return Number(prev.Stroke_Rate) < Number(curr.Stroke_Rate)
            ? prev
            : curr;
        });

        maxStroke = xArray1.reduce(function (prev, curr) {
          return Number(prev.Stroke_Rate) > Number(curr.Stroke_Rate)
            ? prev
            : curr;
        });

        const updatePlotData = drawGraph(
          xArray1,
          xArray1,
          minStroke,
          maxStroke,
          xArray1.length - 1,
          xArray1
        );

        Plotly.update("chartDiv", updatePlotData.data, updatePlotData.layout);
      };

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

      // appending the child element into the DOM
      appendElement();

      // Slider logic start from here
      prevValue = Number(sealBehaviourData[0].Seconds) - initialSeconds;
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
        heartInnerText.innerText = `${Number(currentState.Heart_Rate)?.toFixed(
          2
        )}bpm`;
        strokeInnerText.innerText = `${Number(
          currentState.Stroke_Rate
        )?.toFixed(2)}spm`;
        minuteEle.innerText = `MINUTES INTO DIVE ${currentState.Seconds.toString().toHHMMSS()}`;
        // depthEle.innerText = `DEPTH ${currentState["Depth"]?.toFixed(2)}m`;
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
}
