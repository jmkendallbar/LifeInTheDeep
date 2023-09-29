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
// import drawGraph from "./graph";
import elementStyle from "./elementStyle";
import appendElement from "./appendElement";

// path ---start
import { GPUStatsPanel } from "three/addons/utils/GPUStatsPanel.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import moveGeometryToCoordinates from "./moveGeometryToCoordinates";

const importPromises = [];
let seal = [];
// let model;

// Create an array of Promises for importing each file
var xyz;
for (xyz = 85; xyz <= 86; xyz++) {
  importPromises.push(import(`./seal-info/batch_${xyz}.json`));
}

// Use Promise.all to wait for all imports to complete
Promise.all(importPromises)
  .then((modules) => {
    // Now, 'modules' is an array of the imported module objects
    modules.forEach((module, index) => {
      module.default.forEach((item) => {
        seal.push(item); // Call a function from the imported module
      });
    });
    init();
    // animate();
  })
  .catch((error) => {
    console.error("Error importing files:", error);
  });

// let skip = 1;
export let line, camera2;
let line1;
export let matLine, matLineBasic, matLineDashed;
export let gpuPanel;
export let gui;

// viewport
export let inset = {
  insetWidth: "",
  insetHeight: "",
};
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
export let sealBehaviourData = [];
export let lastIndex;
let isStart = true;
let length = 0;
// let prevValue;

let playSpeed = 1000;
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
  resetBtn,
  pointsPath;

// This is the intializing function when the website will load first
// init();

// start init function
function init() {
  // Display chart using Plotly --start
  initialSeconds = Number(seal[0].Seconds);
  frequency = Number(seal[1].Seconds) - Number(seal[0].Seconds);
  seal.forEach((item) => {
    sealBehaviourData[Number(item.Seconds) - initialSeconds] = item;
  });

  length = sealBehaviourData.length / frequency;
  lastIndex = (length - 1) * frequency;

  // const xArray = sealBehaviourData.map((item) => {
  //   return Number(item.Seconds) / 60;
  // });
  // const yArray = sealBehaviourData.map((item) => {
  //   return Number(item.Stroke_Rate);
  // });

  // minStroke = sealBehaviourData.reduce(function (prev, curr) {
  //   return Number(prev.Stroke_Rate) < Number(curr.Stroke_Rate) ? prev : curr;
  // });

  // maxStroke = sealBehaviourData.reduce(function (prev, curr) {
  //   return Number(prev.Stroke_Rate) > Number(curr.Stroke_Rate) ? prev : curr;
  // });

  // const plotData = drawGraph(
  //   xArray,
  //   yArray,
  //   minStroke,
  //   maxStroke,
  //   lastIndex,
  //   sealBehaviourData
  // );

  // Plotly.newPlot("chartDiv", plotData.data, plotData.layout);
  // plotly chart --end

  // this is the container div where we are showing the overall UI video.
  const container = document.getElementById("container");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.useLegacyLights = false;
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera2 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // camera.up.set(0, 1, 0);

  controls = new OrbitControls(camera, renderer.domElement);
  // controls.minDistance = 10;
  // controls.maxDistance = 1000;

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x33567d);
  scene.fog = new THREE.Fog(0x33567d, 100, 100);

  const hemiLight = new THREE.HemisphereLight(0x33567d, 0x33567d, 3);
  hemiLight.position.set(0, 100, 0);
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
      model.rotation.x = -Math.PI / 2;
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
      sliderOne.max = Number(sealBehaviourData[lastIndex].Seconds);
      sliderTwo.min = Number(sealBehaviourData[0].Seconds) + frequency;
      sliderTwo.max = Number(sealBehaviourData[lastIndex].Seconds);
      sliderTwo.value = Number(sealBehaviourData[lastIndex].Seconds);

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
      rangeSlider.max = length - 1;
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

      // confirmDuration.onclick = function () {
      //   clearInterval(timer);
      //   if (playBtn.style.display === "block") {
      //     pauseContinue();
      //     isTimerStop = true;
      //     pauseBtn.style.display = "block";
      //     playBtn.style.display = "none";
      //   }
      //   let xArray1 = sealBehaviourData.filter((item) => {
      //     if (
      //       sliderOne.value <= Number(item.Seconds) &&
      //       sliderTwo.value >= Number(item.Seconds)
      //     ) {
      //       return item;
      //     }
      //   });

      //   // initialSeconds = xArray1[0].Seconds;
      //   let startIndex = sealBehaviourData
      //     .map((item) => {
      //       if (sliderOne.value === item.Seconds.toString()) {
      //         return Number(item.Seconds);
      //       }
      //     })
      //     .indexOf(Number(sliderOne.value));
      //   let endIndex = sealBehaviourData
      //     .map((item) => {
      //       if (sliderTwo.value === item.Seconds.toString()) {
      //         return Number(item.Seconds);
      //       }
      //     })
      //     .indexOf(Number(sliderTwo.value));
      //   length = (xArray1.length - 1) / frequency;
      //   rangeSlider.min = startIndex;
      //   rangeSlider.value = startIndex;
      //   rangeSlider.defaultValue = startIndex;
      //   rangeSlider.max = endIndex;
      //   modal.style.display = "none";

      //   // after loaded and data this function will call
      //   intervalFunction();

      //   minStroke = xArray1.reduce(function (prev, curr) {
      //     return Number(prev.Stroke_Rate) < Number(curr.Stroke_Rate)
      //       ? prev
      //       : curr;
      //   });

      //   maxStroke = xArray1.reduce(function (prev, curr) {
      //     return Number(prev.Stroke_Rate) > Number(curr.Stroke_Rate)
      //       ? prev
      //       : curr;
      //   });

      //   const updatePlotData = drawGraph(
      //     xArray1,
      //     xArray1,
      //     minStroke,
      //     maxStroke,
      //     xArray1.length - 1,
      //     xArray1
      //   );

      //   Plotly.update("chartDiv", updatePlotData.data, updatePlotData.layout);
      // };

      playSpeedBtn.onclick = function () {
        if (playSpeed === 1000) {
          playSpeed = 500;
          playSpeedBtn.innerText = "2x";
          clearInterval(timer);
          intervalFunction();
          modifyTimeScale(1.5);
        } else if (playSpeed === 500) {
          playSpeed = 200;
          playSpeedBtn.innerText = "5x";
          clearInterval(timer);
          intervalFunction();
          modifyTimeScale(2.5);
        } else if (playSpeed === 200) {
          playSpeed = 100;
          playSpeedBtn.innerText = "10x";
          clearInterval(timer);
          intervalFunction();
          modifyTimeScale(0.25);
        } else if (playSpeed === 100) {
          playSpeed = 10;
          playSpeedBtn.innerText = "100x";
          clearInterval(timer);
          intervalFunction();
          modifyTimeScale(0.5);
        } else {
          playSpeed = 1000;
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
        stateEle.style.backgroundColor =
          currentState?.Simple_Sleep_Code === "Active Waking"
            ? "#296E85"
            : currentState?.Simple_Sleep_Code === "SWS"
            ? "#DAF7A6"
            : currentState?.Simple_Sleep_Code === "REM" ||
              currentState?.Simple_Sleep_Code === "Quiet Waking"
            ? "#FFFF66"
            : "";
        heartInnerText.innerText = `${Number(currentState.Heart_Rate)?.toFixed(
          2
        )}bpm`;
        strokeInnerText.innerText = `${Number(
          currentState.Stroke_Rate
        )?.toFixed(2)}spm`;
        minuteEle.innerText = `MINUTES INTO DIVE ${currentState.Seconds.toString().toHHMMSS()}`;
        depthEle.innerText = `DEPTH ${Number(currentState["Depth"])?.toFixed(
          2
        )}m`;
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

      // end --------------------

      pointsPath = new THREE.CurvePath();

      sealBehaviourData.forEach((item, index) => {
        if (index < sealBehaviourData.length - 1) {
          pointsPath.add(
            new THREE.LineCurve3(
              new THREE.Vector3(
                Number(sealBehaviourData[index].x),
                Number(sealBehaviourData[index].y),
                Number(sealBehaviourData[index].z)
              ),
              new THREE.Vector3(
                Number(sealBehaviourData[index + 1].x),
                Number(sealBehaviourData[index + 1].y),
                Number(sealBehaviourData[index + 1].z)
              )
            )
          );
        }
      });

      const points = pointsPath.curves.reduce(
        (p, d) => [...p, ...d.getPoints(20)],
        []
      );

      const positions = [];
      const colors = [];

      const spline = new THREE.CatmullRomCurve3(points);
      const divisions = Math.round(points.length);
      const point = new THREE.Vector3();
      const color = new THREE.Color();

      const stateColors = [0x535f97, 0x368c87, 0xe9bc65, 0x83bd56, 0x4787b9];

      for (let i = 0, l = divisions; i < l; i++) {
        const t = i / (l - 1);
        spline.getPoint(t, point);
        positions.push(point.x, point.y, point.z);
        if (
          sealBehaviourData[Math.ceil(i / 21)]?.Simple_Sleep_Code ===
          "Active Waking"
        ) {
          color.setHex(stateColors[0]);
          colors.push(color.r, color.g, color.b);
        } else if (
          sealBehaviourData[Math.ceil(i / 21)]?.Simple_Sleep_Code === "SWS"
        ) {
          color.setHex(stateColors[3]);
          colors.push(color.r, color.g, color.b);
        } else {
          color.setHex(stateColors[2]);
          colors.push(color.r, color.g, color.b);
        }
      }

      const geometry = new LineGeometry();
      geometry.setPositions(positions);
      geometry.setColors(colors);

      matLine = new LineMaterial({
        color: 0xffffff,
        linewidth: 10, // in world units with size attenuation, pixels otherwise
        vertexColors: true,

        //resolution:  // to be set by renderer, eventually
        dashed: false,
        alphaToCoverage: true,
      });

      line = new Line2(geometry, matLine);
      line.computeLineDistances();
      line.scale.set(1, 1, 1);
      scene.add(line);

      arrow("x");
      arrow("y");
      arrow("z");

      function arrow(axes) {
        var dir;
        var origin = new THREE.Vector3(0, 0, 0);
        var len = 1;
        var col = axes === "x" ? 0xff0000 : axes === "y" ? 0x00ff00 : 0x0000ff;
        if (axes === "x") dir = new THREE.Vector3(1, 0, 0);
        if (axes === "y") dir = new THREE.Vector3(0, 1, 0);
        if (axes === "z") dir = new THREE.Vector3(0, 0, 1);
        var arrowHelper = new THREE.ArrowHelper(dir, origin, len, col);
        line.add(arrowHelper);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      matLineBasic = new THREE.LineBasicMaterial({ vertexColors: true });
      matLineDashed = new THREE.LineDashedMaterial({
        vertexColors: true,
        scale: 2,
        dashSize: 1,
        gapSize: 1,
      });

      line1 = new THREE.Line(geo, matLineBasic);
      line1.computeLineDistances();
      line1.visible = false;
      scene.add(line1);

      const lod = new THREE.LOD();

      lod.addLevel(line, 20);
      lod.addLevel(line1, 20);

      scene.add(lod);
      lod.rotation.x = -Math.PI / 2;

      window.addEventListener("resize", onWindowResize);
      onWindowResize();

      stats = new Stats();
      // document.body.appendChild(stats.dom);

      gpuPanel = new GPUStatsPanel(renderer.getContext());
      stats.addPanel(gpuPanel);
      stats.showPanel(0);

      animate();

      var gridHelper = new THREE.GridHelper(1000, 1000);
      gridHelper.rotation.x = 0.04;
      gridHelper.rotation.y = 0;
      gridHelper.rotation.z = 0;
      const gridLod = new THREE.LOD();
      gridLod.addLevel(gridHelper, 20);
      scene.add(gridLod);

      var axesHelper = new THREE.AxesHelper(10);
      scene.add(axesHelper);
      axesHelper.rotation.x = -Math.PI / 2;

      function intervalFunction() {
        timer = setInterval(() => {
          if (Number(rangeSlider.value) < Number(rangeSlider.max) - 1) {
            rangeSlider.value = rangeSlider.value * 1 + 1;
            currentStatus();
            moveGeometryToCoordinates(Number(rangeSlider.value));
          } else {
            clearInterval(timer);
            pauseContinue();
            isTimerStop = false;
            pauseBtn.style.display = "none";
            playBtn.style.display = "block";
          }
        }, [playSpeed]);
      }
      // initGui();
      // END SUR
    }
  );

  // JS Charting
}
