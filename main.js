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
import appendElement from "./appendElement";

// path ---start
// import { GPUStatsPanel } from "three/addons/utils/GPUStatsPanel.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import moveGeometryToCoordinates from "./moveGeometryToCoordinates";
import { fetchDataFromAPI } from "./js/fetchDataFromAPI";

let seal = [];
let range;
export let page = 0,
  page1 = 0;
export let perPage = 1999;
export let count = 0;
// let model;

const loadingContainer = document.getElementById("loading-container");
const loadingText = document.getElementById("loading-text");
const loadingOverlay = document.getElementById("loading-overlay");

// Show the loading overlay when the API is called
function showLoadingOverlay() {
  loadingOverlay.style.display = "block";
}

// Hide the loading overlay when the API response is received
function hideLoadingOverlay() {
  loadingOverlay.style.display = "none";
}
const loadingManager = new THREE.LoadingManager();

// This function will be called when a resource is loaded
loadingManager.onProgress = (item, loaded, total) => {
  const progress = loaded / total;
  loadingText.innerHTML = `Loading... ${Math.floor(progress * 100)}%`;
};

// This function will be called when all resources are loaded
loadingManager.onLoad = () => {
  loadingContainer.style.display = "none"; // Hide the loading animation
};

try {
  const { data, totalRange, batchs } = await fetchDataFromAPI(page);
  seal = data;
  range = totalRange;
} catch (error) {
  console.log(error);
}

export let line, camera2;
export let matLine, matLineBasic, matLineDashed;
export let gpuPanel;
export let gui;
let nextInfo = [];
let line1;
let skip1 = 0;



// viewport
export let inset = {
  insetWidth: "",
  insetHeight: "",
};
// declaring variables
export let scene, renderer, camera, stats, model, controls, actions;
export let skeleton, mixer, clock;
export let idleAction, glideAction, swimAction;
export let idleWeight, glideWeight, swimWeight;
export let crossFadeControls = [];
export let cameraDistance = 25;
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
let isStart = true;
let length = 0;
export let gridHelper;
// let prevValue;

let playSpeed = 1000;
let initialSeconds;
let frequency;
let minStroke, maxStroke;
let prevValue;
export let lastIndex;
// Element Variables
export let rangeSlider, updateChart = false,
  strokeEle,
  strokeInnerText,
  heartEle,
  heartInnerText,
  minuteEle,
  depthEle,
  depthInnerText,
  minuteInnerText,
  stateEle,
  playSpeedBtn,
  confirmDuration,
  pauseBtn,
  cropBtn,
  playBtn,
  resetBtn,
  chartDiv,
  currentWidth,
  perSecWidth,
  pitchEle,
  pitchInnerText,
  rollEle,
  rollInnerText,
  headEle,
  headInnerText,
  pointsPath,
  svgContainer,
  targetElment,
  targetdWidth,
  absDiv, modal,
  sliderOne, sliderTwo, slideOnePage, sliderTwoPage, isSliderClicked = false;

let timer;
let isTimerStop = true;
let points;
export let skipper = 200;
// This is the intializing function when the website will load first
init();
// let lod = new THREE.LOD();
// start init function
function init() {
  // creating instance for loader which is use to load our model by using s3 bucket
  const loader = new GLTFLoader(loadingManager);
  loader.load(
    "https://visualising-life-in-the-deep.s3.amazonaws.com/Seal_Animation.glb",
    function (gltf) {
      model = gltf.scene;

      initialSeconds = Number(seal[0].Seconds);
      frequency = Number(seal[1].Seconds) - Number(seal[0].Seconds);
      seal.forEach((item) => {
        sealBehaviourData[Number(item.Seconds) - initialSeconds] = item;
      });

      length = sealBehaviourData.length / frequency;
      lastIndex = (length - 1) * frequency;
      perSecWidth = targetdWidth / sealBehaviourData.length;

      // Plotly chart -- start
      const xArray = sealBehaviourData.map((item) => {
        return Number(item.Seconds) / 60;
      });
      const yArray = sealBehaviourData.map((item) => {
        return Number(item.Stroke_Rate);
      });

      minStroke = sealBehaviourData.reduce(function (prev, curr) {
        return Number(prev.Stroke_Rate) < Number(curr.Stroke_Rate)
          ? prev
          : curr;
      });

      maxStroke = sealBehaviourData.reduce(function (prev, curr) {
        return Number(prev.Stroke_Rate) > Number(curr.Stroke_Rate)
          ? prev
          : curr;
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

      // This is the container div where we are showing the overall video.
      const container = document.getElementById("container");
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.useLegacyLights = false;
      container.appendChild(renderer.domElement);

      // First camera which is used for the big screen
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // Second camera which is used for the small top left screen
      camera2 = new THREE.PerspectiveCamera(
        20,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      controls = new OrbitControls(camera, renderer.domElement);

      clock = new THREE.Clock();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x33567d);
      scene.fog = new THREE.Fog(0x33567d, 100, 100);

      // background fog and color -- start
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

      // end --

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      scene.add(mesh);

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
      createGrid();

      const animations = gltf.animations;

      mixer = new THREE.AnimationMixer(model);

      // Used to select animation type
      idleAction = mixer.clipAction(animations[6]);
      glideAction = mixer.clipAction(animations[28]);
      swimAction = mixer.clipAction(animations[15]);

      actions = [idleAction, glideAction, swimAction];

      activateAllActions();

      // Declaring the varaibles for UI component like button, rangeSlider and more.
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
      minuteInnerText = document.createElement("span");
      depthEle = document.createElement("span");
      depthInnerText = document.createElement("span");
      stateEle = document.createElement("span");
      headEle = document.createElement("span");
      rollEle = document.createElement("span");
      pitchEle = document.createElement("span");
      headInnerText = document.createElement("span");
      rollInnerText = document.createElement("span");
      pitchInnerText = document.createElement("span");
      playSpeedBtn = document.createElement("button");
      confirmDuration = document.getElementById("confirmClip");
      chartDiv = document.getElementById("chartHoverDiv");
      svgContainer = document.getElementsByClassName("svg-container");
      targetElment = document.getElementsByClassName("drag");
      absDiv = document.createElement("div");
      targetdWidth = Number(targetElment[0].getAttribute("width"));
      absDiv.style.width = targetdWidth + "px";
      absDiv.style.position = "absolute";
      absDiv.style.height = "129px";
      absDiv.style.backgroundColor = "white";
      absDiv.style.opacity = "0.8";
      absDiv.style.top = "72px";
      absDiv.style.right = "79px";
      svgContainer[0].appendChild(absDiv);

      // timeline crop video's code start from here
      cropBtn.id = "cropBtnId";
      cropBtn.style.cursor = "pointer";

      // Get the modal
      modal = document.getElementById("myModal");

      var span = document.getElementsByClassName("close")[0];

      // When the user clicks the button, open the modal
      cropBtn.onclick = function () {
        modal.style.display = "block";
        // clipVideotimeRangeSetup()
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

      sliderOne = document.getElementById("slider-1");
      sliderTwo = document.getElementById("slider-2");
      let displayValOne = document.getElementById("range1");
      let displayValTwo = document.getElementById("range2");
      let minGap = 0;
      let sliderTrack = document.querySelector(".slider-track");
      let sliderMaxValue = document.getElementById("slider-1").max;
      clipVideotimeRangeSetup()

      // DUAL RANGE SLIDER
      function slideOne() {
        if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
          sliderOne.value = parseInt(sliderTwo.value) - minGap;
        }
        displayValOne.textContent =
          (
            sliderOne.value / 60).toFixed(0) + " min";
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
      // rangeSlider.max = length - 1;
      rangeSlider.max = range;
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
        clearInterval(timer)
        showLoadingOverlay()
        page = 0
        skip1 = 0
        page1 = 0
        prevValue = 0
        pointsPath = new THREE.CurvePath();
        dataSetup(page, true)
        rangeSlider.value = rangeSlider.min;
      };

      // clip video and chart method
      confirmDuration.onclick = function () {
        clearInterval(timer);
        pointsPath = new THREE.CurvePath();
        page = Math.floor(Number(sliderOne.value) / perPage);
        page1 = Math.floor(Number(sliderOne.value) / perPage);
        sliderTwoPage = Math.floor(Number(sliderTwo.value) / perPage);
        // console.log(page, sliderOne.value, sliderTwo.value);
        rangeSlider.min = Number(sliderOne.value);
        rangeSlider.value = Number(sliderOne.value);
        rangeSlider.defaultValue = Number(sliderOne.value);
        rangeSlider.max = Number(sliderTwo.value);
        isSliderClicked = true
        updateChart = true
        let skip = page1 * perPage;
        count = rangeSlider.value - skip;
        showLoadingOverlay()
        dataSetup(page, true)
        if (playBtn.style.display === "block") {
          pauseContinue();
          isTimerStop = true;
          pauseBtn.style.display = "block";
          playBtn.style.display = "none";
        }
        modal.style.display = "none";
      };

      // Play speed control method
      playSpeedBtn.onclick = function () {
        if (!isTimerStop) {
          return;
        }
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

      // Appending the child element into the DOM
      appendElement();

      // Slider onclick method
      prevValue = Number(sealBehaviourData[0].Seconds) - initialSeconds;
      rangeSlider.onclick = function () {
        clearInterval(timer);
        showLoadingOverlay();
        page = Math.floor(rangeSlider.value / perPage);
        page1 = Math.floor(rangeSlider.value / perPage);
        let skip = page1 * perPage;
        count = rangeSlider.value - skip;
        pointsPath = new THREE.CurvePath();
        dataSetup(page);
        sealBehaviourData = nextInfo;
        updateChart = true
        // hideLoadingOverlay();
        // updateChartData(nextInfo)
        if (!isTimerStop) {
          isTimerStop = true;
          pauseContinue();
          pauseBtn.style.display = "block";
          playBtn.style.display = "none";
        }
      };
      intervalFunction();
      perSecWidth = targetdWidth / sealBehaviourData.length;

      // Creating track method call
      pointsPath = new THREE.CurvePath();
      createPointPath(sealBehaviourData);
      // Creating water surface method call

      // initGui();
      // createGrid();
    }
  );
}

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
function intervalFunction() {
  timer = setInterval(() => {
    if (Number(rangeSlider.value) < Number(rangeSlider.max) - 1) {
      count++;
      rangeSlider.value = rangeSlider.value * 1 + 1;
      const skip = (page + 1) * perPage - skipper;
      const ranger = Number(rangeSlider.value);
      if (skip == ranger) {
        skip1 = (page + 1) * perPage;
        page++;
        dataSetup(page);
      }
      if (skip1 == ranger) {
        sealBehaviourData = nextInfo;
        updateChartData(sealBehaviourData)
        page1++;
      }
      // if (page === sliderTwoPage) {
      //   clearInterval(timer)
      //   isSliderClicked = false
      // }
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

function currentStatus() {
  let skip = page1 * perPage;
  console.log(rangeSlider.value);
  if (Number(prevValue) < Number(rangeSlider.value)) {
    currentWidth =
      parseFloat(absDiv.style.width) - (
        Number(perSecWidth) *
        (Number(rangeSlider.value) - Number(prevValue + skip)));
  } else {
    currentWidth =
      parseFloat(absDiv.style.width) +
      Number(perSecWidth) *
      Number(Number(rangeSlider.value) - Number(prevValue + skip));

  }
  //  else {
  //   currentWidth =
  //     Number(chartDiv.style.width.split("%")[0]) +
  //     Number(perSecWidth) * (Number(prevValue) - Number(rangeSlider.value));
  // }
  absDiv.style.width = currentWidth + "px";
  const currentState =
    sealBehaviourData[Number(rangeSlider.value - skip) * Number(frequency)];
  const prevState = sealBehaviourData[Number(prevValue) * Number(frequency)];
  stateEle.innerText = currentState?.Simple_Sleep_Code;
  stateEle.style.backgroundColor =
    currentState?.Simple_Sleep_Code === "Active Waking"
      ? "#0081AA"
      : currentState?.Simple_Sleep_Code === "SWS"
        ? "#00B448"
        : currentState?.Simple_Sleep_Code === "REM" ||
          currentState?.Simple_Sleep_Code === "Quiet Waking"
          ? "#E2BE00"
          : "";
  heartInnerText.innerText = `${Number(currentState?.Heart_Rate)?.toFixed(
    2
  )}bpm`;
  strokeInnerText.innerText = `${Number(currentState?.Stroke_Rate)?.toFixed(
    2
  )}spm`;
  minuteInnerText.innerText = `${currentState?.Seconds.toString().toHHMMSS()}`;
  pitchInnerText.innerText = `${Number(currentState?.pitch)?.toFixed(4)}`;
  rollInnerText.innerText = `${Number(currentState?.roll)?.toFixed(4)}`;
  headInnerText.innerText = `${Number(currentState?.heading)?.toFixed(4)}`;
  depthInnerText.innerText = `${Number(currentState["Depth"])?.toFixed(2)}m`;
  if (!isStart) {
    if (currentState?.Simple_Sleep_Code === "REM") {
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
      currentState?.Simple_Sleep_Code === "SWS" ||
      currentState?.Simple_Sleep_Code === "Quiet Waking"
    ) {
      if (prevState.Simple_Sleep_Code === "REM") {
        prepareCrossFade(idleAction, glideAction, 1.0);
      } else if (prevState.Simple_Sleep_Code === "Active Waking") {
        prepareCrossFade(swimAction, glideAction, 1.0);
      }
    }
    if (currentState?.Simple_Sleep_Code === "Active Waking") {
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
    if (currentState?.Simple_Sleep_Code === "Active Waking") {
      prepareCrossFade(glideAction, swimAction, 1.0);
    } else if (currentState?.Simple_Sleep_Code === "REM") {
      prepareCrossFade(glideAction, idleAction, 1.0);
    }
    isStart = false;
  }
  prevValue = rangeSlider.value - skip;
}

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

export function createPointPath(arr) {
  // pointsPath = new THREE.CurvePath();
  // let curve;
  let arr1 = [];
  arr.forEach((item, index) => {
    if (index < arr.length - 1) {
      const startPoint = new THREE.Vector3(
        Number(arr[index].x),
        Number(arr[index].y),
        Number(arr[index].z)
      );

      const endPoint = new THREE.Vector3(
        Number(arr[index + 1].x),
        Number(arr[index + 1].y),
        Number(arr[index + 1].z)
      );

      // curve = new THREE.LineCurve3(startPoint, endPoint);
      arr1.push(new THREE.LineCurve3(startPoint, endPoint));
      // Add the curve to pointsPath
      pointsPath.add(new THREE.LineCurve3(startPoint, endPoint));
    }
  });

  // console.log("points", arr1);
  points = arr1.reduce((p, d) => [...p, ...d.getPoints(20)], []);

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
    if (arr[Math.ceil(i / 21)]?.Simple_Sleep_Code === "Active Waking") {
      color.setHex(stateColors[0]);
      colors.push(color.r, color.g, color.b);
    } else if (arr[Math.ceil(i / 21)]?.Simple_Sleep_Code === "SWS") {
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
    linewidth: 1, // in world units with size attenuation, pixels otherwise
    vertexColors: true,
    //resolution:  // to be set by renderer, eventually
    dashed: false,
    alphaToCoverage: true,
  });

  line = new Line2(geometry, matLine);
  line.computeLineDistances();
  line.scale.set(1, 1, 1);
  // scene.add(line);

  arrow("x");
  arrow("y");
  arrow("z");
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
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

  // stats = new Stats();
  // document.body.appendChild(stats.dom);

  // gpuPanel = new GPUStatsPanel(renderer.getContext());
  // stats.addPanel(gpuPanel);
  // stats.showPanel(0);

  animate();
}

//Creating grid as water surface
export function createGrid() {
  gridHelper = new THREE.GridHelper(1000, 500);
  gridHelper.rotation.x = 0.04;
  gridHelper.rotation.y = 0;
  gridHelper.rotation.z = 0;
  gridHelper.position.set(0, 0, 0);
  const gridLod = new THREE.LOD();
  gridLod.addLevel(gridHelper, 20);
  scene.add(gridLod);

  var axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);
  axesHelper.rotation.x = -Math.PI / 2;
}

export function createPlane() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(5, 1, 1);
  camera.lookAt(0, 1, 0);

  camera2 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera2.position.copy(camera.position);
  camera2.lookAt(0, 1, 0);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 10;
  controls.maxDistance = 100;

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
  // Create a plane geometry
  const geometry = new THREE.PlaneGeometry(100, 100);

  // Create a material for the plane
  const material = new THREE.MeshPhongMaterial({
    color: 0xcbcbcb,
    depthWrite: false,
  });

  // Create the mesh
  const mesh = new THREE.Mesh(geometry, material);

  // Rotate the mesh to lie flat on the x-y plane
  mesh.rotation.x = -Math.PI / 2;

  // Enable shadow casting and receiving for the mesh
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// Define the function to fetch and populate data
export async function dataSetup(page, initial = false) {
  try {
    clearInterval(timer);
    const { data, batchs } = await fetchDataFromAPI(page);
    if (data && batchs) {
      prevValue = 0;
      initialSeconds = Number(data[0].Seconds);
      frequency = Number(data[1].Seconds) - Number(data[0].Seconds);
      data.forEach((item) => {
        initial ? (sealBehaviourData[Number(item.Seconds) - initialSeconds] = item) :
          (nextInfo[Number(item.Seconds) - initialSeconds] = item);
      });
      createPointPath(initial ? sealBehaviourData : nextInfo);
      intervalFunction();
      hideLoadingOverlay()
      if (updateChart) {
        absDiv.style.width = targetdWidth + "px";
        updateChartData(sealBehaviourData)
        updateChart = false
      }
    }
  } catch (error) {
    console.log(error);
    hideLoadingOverlay();
  }
}

function clipVideotimeRangeSetup() {
  sliderOne.min = 0;
  sliderTwo.min = 0;
  sliderOne.value = 0;
  sliderTwo.value = range;
  sliderOne.max = range;
  sliderTwo.max = range;
}

// Ensure the DOMContentLoaded listener is set up outside the function
document.addEventListener('DOMContentLoaded', clipVideotimeRangeSetup);

// Plotly update chart -- Function
function updateChartData(data) {
  frequency = Number(data[1].Seconds) - Number(data[0].Seconds);
  length = data.length / frequency;
  lastIndex = (length - 1) * frequency;
  const xArray = data.map((item) => {
    return Number(item.Seconds) / 60;
  });
  const yArray = data.map((item) => {
    return Number(item.Stroke_Rate);
  });

  minStroke = data.reduce(function (prev, curr) {
    return Number(prev.Stroke_Rate) < Number(curr.Stroke_Rate)
      ? prev
      : curr;
  });

  maxStroke = data.reduce(function (prev, curr) {
    return Number(prev.Stroke_Rate) > Number(curr.Stroke_Rate)
      ? prev
      : curr;
  });

  const plotData = drawGraph(
    xArray,
    yArray,
    minStroke,
    maxStroke,
    lastIndex,
    data
  );
  Plotly.newPlot("chartDiv", plotData.data, plotData.layout);
}
