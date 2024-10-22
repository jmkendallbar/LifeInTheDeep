import * as THREE from 'three';
import './main.css';
import Stats from 'three/addons/libs/stats.module.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import createPanel from './panel';
// utils.js
import {
	onWindowResize,
	modifyTimeScale,
	activateAllActions,
	pauseContinue,
	prepareCrossFade,
} from './utils.js';
import animate from './animate';
import drawGraph from './graph';
import elementStyle from './elementStyle';
import domHelper from './domHelper';

// path ---start
import {GPUStatsPanel} from 'three/addons/utils/GPUStatsPanel.js';
import {Line2} from 'three/addons/lines/Line2.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import moveGeometryToCoordinates from './moveGeometryToCoordinates';
import addHTMLElementsToDOM from './domHelper';
import { addPathToMap } from './map';

const importPromises = [];
let seal = [];

const loadingContainer = document.getElementById('loading-container');
const loadingText = document.getElementById('loading-text');
const loadingManager = new THREE.LoadingManager();

// TODO: Add to AwesomeDB and load from there
const sceneActions = {
	'Seal_Animation.glb': {
		actions: {
			idleActionIdx: 6,
			glideActionIdx: 28,
			swimActionIdx: 15,
		},
	},
	'Seal._2.glb': {
		actions: {
			idleActionIdx: 1,
			glideActionIdx: 0,
			swimActionIdx: 0,
		},
	},
};


// This function will be called when a resource is loaded
loadingManager.onProgress = (item, loaded, total) => {
	const progress = loaded / total;
	loadingText.innerHTML = `Loading... ${Math.floor(progress * 100)}%`;
};

// This function will be called when all resources are loaded
loadingManager.onLoad = () => {
	loadingContainer.style.display = 'none'; // Hide the loading animation
};

// Create an array of Promises for importing each file
var xyz;
for (xyz = 85; xyz <= 87; xyz++) {
	importPromises.push(import(`./seal-info/batch_${xyz}.json`));
	// http://awesome-compute.sdsc.edu:8000/v1/hypnop/test33_HypoactiveHeidi?start_time=2021-04-22T16%3A58%3A13&end_time=2021-04-22T17%3A33%3A44&auth_status=true
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
	})
	.catch((error) => {
		console.error('Error importing files:', error);
	});

// Variables for track
export let line, camera2;
export let matLine, matLineBasic, matLineDashed;
export let gpuPanel;
export let gui;
let line1;

// viewport
export let inset = {
	insetWidth: '',
	insetHeight: '',
};
// declaring variables
export let scene, renderer, camera, stats, model, controls, actions;
export let skeleton, mixer, clock;
export let idleAction, glideAction, swimAction;
export let idleWeight, glideWeight, swimWeight;
export let crossFadeControls = [];
export let cameraDistance = 25;
export let selectedSceneName = Object.keys(sceneActions).shift();
export const sceneNames = Object.keys(sceneActions);
export const nextStep = {sizeOfNextStep: 0};
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
export let marineLifeBehaviourData = [];
let isStart = true;
let length = 0;
export let gridHelper;
// let prevValue;

let playSpeed = 1000;
let initialSeconds;
let frequency;
let minStroke, maxStroke;
let prevValue;
let timer;
let isTimerStop = true;
export let lastIndex;

// Element Variables
export let rangeSlider,
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
           absDiv;

// Initial call
export function init() {
	// creating instance for loader which is use to load our model by using s3 bucket
	const loader = new GLTFLoader(loadingManager);
	const sceneName = getSelectedSceneName();
	loader.load(
		// "gltf/Seal._2.glb",
		`gltf/${sceneName}`,
		// "https://visualising-life-in-the-deep.s3.amazonaws.com/Seal_Animation.glb",
		function (gltf) {
			model = gltf.scene;
			
			initialSeconds = Number(seal[0].Seconds);
			frequency = Number(seal[1].Seconds) - Number(seal[0].Seconds);
			addPathToMap(seal[0].SealID)
			seal.forEach((item) => {
				marineLifeBehaviourData[Number(item.Seconds) - initialSeconds] = item;
			});
			
			length = marineLifeBehaviourData.length / frequency;
			lastIndex = (length - 1) * frequency;
			perSecWidth = targetdWidth / marineLifeBehaviourData.length;
			
			// Plotly chart -- start
			const xArray = marineLifeBehaviourData.map((item) => {
				return Number(item.Seconds) / 60;
			});
			const yArray = marineLifeBehaviourData.map((item) => {
				return Number(item.Stroke_Rate);
			});
			
			minStroke = marineLifeBehaviourData.reduce(function (prev, curr) {
				return Number(prev.Stroke_Rate) < Number(curr.Stroke_Rate)
					? prev
					: curr;
			});
			
			maxStroke = marineLifeBehaviourData.reduce(function (prev, curr) {
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
				marineLifeBehaviourData,
			);
			
			Plotly.newPlot('chartDiv', plotData.data, plotData.layout);
			// plotly chart --end
			
			// This is the container div where we are showing the overall video.
			const container = document.getElementById('container');
			renderer = new THREE.WebGLRenderer({antialias: true});
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
				1000,
			);
			
			// Second camera which is used for the small top left screen
			camera2 = new THREE.PerspectiveCamera(
				20,
				window.innerWidth / window.innerHeight,
				0.1,
				1000,
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
				new THREE.MeshPhongMaterial({
					color: 0xcbcbcb,
					depthWrite: false,
				}),
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
			
			const animations = gltf.animations;
			
			mixer = new THREE.AnimationMixer(model);
			
			// Used to select animation type
			// Lookup animation indices based on scene name
			idleAction = mixer.clipAction(animations[sceneActions[sceneName].actions.idleActionIdx]);
			glideAction = mixer.clipAction(animations[sceneActions[sceneName].actions.glideActionIdx]);
			swimAction = mixer.clipAction(animations[sceneActions[sceneName].actions.swimActionIdx]);
			
			actions = [idleAction, glideAction, swimAction];
			
			activateAllActions();
			
			// Declaring the varaibles for UI component like button, rangeSlider and more.
			rangeSlider = document.createElement('input');
			pauseBtn = document.getElementById('pause-icon');
			cropBtn = document.getElementById('crop-icon');
			playBtn = document.getElementById('play-icon');
			resetBtn = document.getElementById('reset-icon');
			strokeEle = document.createElement('span');
			strokeInnerText = document.createElement('span');
			heartEle = document.createElement('span');
			heartInnerText = document.createElement('span');
			minuteEle = document.createElement('span');
			minuteInnerText = document.createElement('span');
			depthEle = document.createElement('span');
			depthInnerText = document.createElement('span');
			stateEle = document.createElement('span');
			headEle = document.createElement('span');
			rollEle = document.createElement('span');
			pitchEle = document.createElement('span');
			headInnerText = document.createElement('span');
			rollInnerText = document.createElement('span');
			pitchInnerText = document.createElement('span');
			playSpeedBtn = document.createElement('button');
			confirmDuration = document.getElementById('confirmClip');
			svgContainer = document.getElementsByClassName('svg-container');
			targetElment = document.getElementsByClassName('drag');
			absDiv = document.createElement('div');
			targetdWidth = Number(targetElment[0].getAttribute('width'));
			absDiv.style.width = targetdWidth + 'px';
			absDiv.style.position = 'absolute';
			absDiv.style.height = '129px';
			absDiv.style.backgroundColor = 'white';
			absDiv.style.opacity = '0.8';
			absDiv.style.top = '72px';
			absDiv.style.right = '79px';
			svgContainer[0].appendChild(absDiv);
			
			// timeline crop video's code start from here
			cropBtn.id = 'cropBtnId';
			cropBtn.style.cursor = 'pointer';
			
			// Get the modal
			var modal = document.getElementById('myModal');
			
			var span = document.getElementsByClassName('close')[0];
			
			// When the user clicks the button, open the modal
			cropBtn.onclick = function () {
				modal.style.display = 'block';
			};
			
			// When the user clicks on <span> (x), close the modal
			span.onclick = function () {
				modal.style.display = 'none';
			};
			
			// When the user clicks anywhere outside of the modal, close it
			window.onclick = function (event) {
				if (event.target == modal) {
					modal.style.display = 'none';
				}
			};
			
			let sliderOne = document.getElementById('slider-1');
			let sliderTwo = document.getElementById('slider-2');
			let displayValOne = document.getElementById('range1');
			let displayValTwo = document.getElementById('range2');
			let minGap = 0;
			let sliderTrack = document.querySelector('.slider-track');
			let sliderMaxValue = document.getElementById('slider-1').max;
			sliderOne.min = Number(marineLifeBehaviourData[0].Seconds);
			sliderOne.value = Number(marineLifeBehaviourData[0].Seconds);
			sliderOne.max = Number(marineLifeBehaviourData[lastIndex].Seconds);
			sliderTwo.min = Number(marineLifeBehaviourData[0].Seconds) + frequency;
			sliderTwo.max = Number(marineLifeBehaviourData[lastIndex].Seconds);
			sliderTwo.value = Number(marineLifeBehaviourData[lastIndex].Seconds);
			
			// DUAL RANGE SLIDER
			function slideOne () {
				if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
					sliderOne.value = parseInt(sliderTwo.value) - minGap;
				}
				displayValOne.textContent =
					(
						sliderOne.value / 60 -
						Number(marineLifeBehaviourData[0].Seconds) / 60
					).toFixed(0) + ' min';
				fillColor();
			}
			
			function slideTwo () {
				if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
					sliderTwo.value = parseInt(sliderOne.value) + minGap;
				}
				displayValTwo.textContent =
					(sliderTwo.value / 60 - sliderOne.value / 60).toFixed(0) + ' min';
				fillColor();
			}
			
			function fillColor () {
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
			rangeSlider.min = Number(marineLifeBehaviourData[0].Seconds) - initialSeconds;
			rangeSlider.max = length - 1;
			rangeSlider.defaultValue =
				Number(marineLifeBehaviourData[0].Seconds) - initialSeconds;
			
			// pause button
			pauseBtn.style.cursor = 'pointer';
			pauseBtn.onclick = function () {
				if (isTimerStop) {
					clearInterval(timer);
					pauseContinue();
					isTimerStop = false;
					pauseBtn.style.display = 'none';
					playBtn.style.display = 'block';
				}
			};
			
			// play button
			playBtn.style.cursor = 'pointer';
			playBtn.onclick = function () {
				if (!isTimerStop) {
					intervalFunction();
					pauseContinue();
					isTimerStop = true;
					pauseBtn.style.display = 'block';
					playBtn.style.display = 'none';
				}
			};
			
			// reset button
			resetBtn.style.cursor = 'pointer';
			resetBtn.onclick = function () {
				rangeSlider.value = rangeSlider.min;
			};
			
			// clip video and chart method
			confirmDuration.onclick = function () {
				clearInterval(timer);
				if (playBtn.style.display === 'block') {
					pauseContinue();
					isTimerStop = true;
					pauseBtn.style.display = 'block';
					playBtn.style.display = 'none';
				}
				let xArray1 = marineLifeBehaviourData.filter((item) => {
					if (
						sliderOne.value <= Number(item.Seconds) &&
						sliderTwo.value >= Number(item.Seconds)
					) {
						return item;
					}
				});
				// initialSeconds = xArray1[0].Seconds;
				let startIndex = marineLifeBehaviourData
					.map((item) => {
						if (sliderOne.value === item.Seconds.toString()) {
							return Number(item.Seconds);
						}
					})
					.indexOf(Number(sliderOne.value));
				let endIndex = marineLifeBehaviourData
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
				modal.style.display = 'none';
				
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
					xArray1,
				);
				prevValue = rangeSlider.value;
				perSecWidth = targetdWidth / xArray1.length;
				absDiv.style.width = targetdWidth + 'px';
				Plotly.update('chartDiv', updatePlotData.data, updatePlotData.layout);
			};
			
			// Play speed control method
			playSpeedBtn.onclick = function () {
				if (!isTimerStop) {
					return;
				}
				if (playSpeed === 1000) {
					playSpeed = 500;
					playSpeedBtn.innerText = '2x';
					clearInterval(timer);
					intervalFunction();
					modifyTimeScale(1.5);
				} else if (playSpeed === 500) {
					playSpeed = 200;
					playSpeedBtn.innerText = '5x';
					clearInterval(timer);
					intervalFunction();
					modifyTimeScale(2.5);
				} else if (playSpeed === 200) {
					playSpeed = 100;
					playSpeedBtn.innerText = '10x';
					clearInterval(timer);
					intervalFunction();
					modifyTimeScale(0.25);
				} else if (playSpeed === 100) {
					playSpeed = 10;
					playSpeedBtn.innerText = '100x';
					clearInterval(timer);
					intervalFunction();
					modifyTimeScale(0.5);
				} else {
					playSpeed = 1000;
					playSpeedBtn.innerText = '1x';
					clearInterval(timer);
					intervalFunction();
					modifyTimeScale(1.0);
				}
			};
			
			// Appending the child element into the DOM
			addHTMLElementsToDOM();
			
			// Slider onclick method
			prevValue = Number(marineLifeBehaviourData[0].Seconds) - initialSeconds;
			rangeSlider.onclick = function () {
				clearInterval(timer);
				intervalFunction();
				
				if (!isTimerStop) {
					isTimerStop = true;
					pauseContinue();
					pauseBtn.style.display = 'block';
					playBtn.style.display = 'none';
				}
			};
			intervalFunction();
			perSecWidth = targetdWidth / marineLifeBehaviourData.length;
			
			// Creating track method call
			createPointPath();
			// Creating water surface method call
			createGrid();
			
			// initGui();
		},
	);
}

String.prototype.toHHMMSS = function () {
	var sec_num = parseInt(this, 10); // don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - hours * 3600) / 60);
	var seconds = sec_num - hours * 3600 - minutes * 60;
	
	if (hours < 10) {
		hours = '0' + hours;
	}
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}
	return hours + ':' + minutes + ':' + seconds;
};

function intervalFunction () {
	timer = setInterval(() => {
		if (Number(rangeSlider.value) < Number(rangeSlider.max) - 1) {
			rangeSlider.value = rangeSlider.value * 1 + 1;
			currentStatus();
			moveGeometryToCoordinates(Number(rangeSlider.value));
		} else {
			clearInterval(timer);
			pauseContinue();
			isTimerStop = false;
			pauseBtn.style.display = 'none';
			playBtn.style.display = 'block';
		}
	}, [playSpeed]);
}

function currentStatus () {
	if (Number(prevValue) < Number(rangeSlider.value)) {
		currentWidth =
			parseFloat(absDiv.style.width) -
			Number(perSecWidth) *
			Number(Number(rangeSlider.value) - Number(prevValue));
	} else if (Number(prevValue) - 1 < Number(rangeSlider.value)) {
		currentWidth =
			parseFloat(absDiv.style.width) -
			Number(perSecWidth) *
			Number(Number(rangeSlider.value) - Number(prevValue));
	} else {
		currentWidth =
			parseFloat(absDiv.style.width) +
			Number(perSecWidth) * (Number(prevValue) - Number(rangeSlider.value));
	}
	absDiv.style.width = currentWidth + 'px';
	const currentState =
		      marineLifeBehaviourData[Number(rangeSlider.value) * Number(frequency)];
	const prevState = marineLifeBehaviourData[Number(prevValue) * Number(frequency)];
	stateEle.innerText = currentState?.Simple_Sleep_Code;
	stateEle.style.backgroundColor =
		currentState?.Simple_Sleep_Code === 'Active Waking'
			? '#0081AA'
			: currentState?.Simple_Sleep_Code === 'SWS'
				? '#00B448'
				: currentState?.Simple_Sleep_Code === 'REM' 
					? '#F5C24C'
					: currentState?.Simple_Sleep_Code === 'Quiet Waking'
						? '#5092B6'
						: '';
	heartInnerText.innerText = `${Number(currentState.Heart_Rate)?.toFixed(
		2,
	)}bpm`;
	strokeInnerText.innerText = `${Number(currentState.Stroke_Rate)?.toFixed(
		2,
	)}spm`;
	minuteInnerText.innerText = `${currentState.Seconds.toString().toHHMMSS()}`;
	pitchInnerText.innerText = `${Number(currentState.pitch)?.toFixed(4)}`;
	rollInnerText.innerText = `${Number(currentState.roll)?.toFixed(4)}`;
	headInnerText.innerText = `${Number(currentState.heading)?.toFixed(4)}`;
	depthInnerText.innerText = `${Number(currentState['Depth'])?.toFixed(2)}m`;
	if (!isStart) {
		if (currentState.Simple_Sleep_Code === 'REM') {
			if (
				prevState.Simple_Sleep_Code === 'SWS' ||
				prevState.Simple_Sleep_Code === 'Quiet Waking'
			) {
				prepareCrossFade(glideAction, idleAction, 1.0);
			} else if (prevState.Simple_Sleep_Code === 'Active Waking') {
				prepareCrossFade(swimAction, idleAction, 1.0);
			}
		}
		if (
			currentState.Simple_Sleep_Code === 'SWS' ||
			currentState.Simple_Sleep_Code === 'Quiet Waking'
		) {
			if (prevState.Simple_Sleep_Code === 'REM') {
				prepareCrossFade(idleAction, glideAction, 1.0);
			} else if (prevState.Simple_Sleep_Code === 'Active Waking') {
				prepareCrossFade(swimAction, glideAction, 1.0);
			}
		}
		if (currentState.Simple_Sleep_Code === 'Active Waking') {
			if (prevState.Simple_Sleep_Code === 'REM') {
				prepareCrossFade(idleAction, swimAction, 1.0);
			} else if (
				prevState.Simple_Sleep_Code === 'SWS' ||
				prevState.Simple_Sleep_Code === 'Quiet Waking'
			) {
				prepareCrossFade(glideAction, swimAction, 1.0);
			}
		}
	} else if (isStart) {
		if (currentState.Simple_Sleep_Code === 'Active Waking') {
			prepareCrossFade(glideAction, swimAction, 1.0);
		} else if (currentState.Simple_Sleep_Code === 'REM') {
			prepareCrossFade(glideAction, idleAction, 1.0);
		}
		isStart = false;
	}
	prevValue = rangeSlider.value;
}

// Method for x,y and z arrow axis
function arrow (axes) {
	var dir;
	var origin = new THREE.Vector3(0, 0, 0);
	var len = 1;
	var col = axes === 'x' ? 0xff0000 : axes === 'y' ? 0x00ff00 : 0x0000ff;
	if (axes === 'x') dir = new THREE.Vector3(1, 0, 0);
	if (axes === 'y') dir = new THREE.Vector3(0, 1, 0);
	if (axes === 'z') dir = new THREE.Vector3(0, 0, 1);
	var arrowHelper = new THREE.ArrowHelper(dir, origin, len, col);
	line.add(arrowHelper);
}

// Seal track with color
function createPointPath () {
	pointsPath = new THREE.CurvePath();
	
	marineLifeBehaviourData.forEach((item, index) => {
		if (index < marineLifeBehaviourData.length - 1) {
			pointsPath.add(
				new THREE.LineCurve3(
					new THREE.Vector3(
						Number(marineLifeBehaviourData[index].x),
						Number(marineLifeBehaviourData[index].y),
						Number(marineLifeBehaviourData[index].z),
					),
					new THREE.Vector3(
						Number(marineLifeBehaviourData[index + 1].x),
						Number(marineLifeBehaviourData[index + 1].y),
						Number(marineLifeBehaviourData[index + 1].z),
					),
				),
			);
		}
	});
	
	const points = pointsPath.curves.reduce(
		(p, d) => [...p, ...d.getPoints(20)],
		[],
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
			marineLifeBehaviourData[Math.ceil(i / 21)]?.Simple_Sleep_Code ===
			'Active Waking'
		) {
			color.setHex(stateColors[0]);
			colors.push(color.r, color.g, color.b);
		} else if (
			marineLifeBehaviourData[Math.ceil(i / 21)]?.Simple_Sleep_Code === 'SWS'
		) {
			color.setHex(stateColors[3]);
			colors.push(color.r, color.g, color.b);
		} else if (marineLifeBehaviourData[Math.ceil(i / 21)]?.Simple_Sleep_Code === 'REM'
		) {
			color.setHex(stateColors[2]);
			colors.push(color.r, color.g, color.b);
		} else {
			color.setHex(stateColors[4]);
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
	scene.add(line);
	
	arrow('x');
	arrow('y');
	arrow('z');
	
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	
	matLineBasic = new THREE.LineBasicMaterial({vertexColors: true});
	matLineDashed = new THREE.LineDashedMaterial({
		vertexColors: true,
		scale: 2,
		dashSize: 1,
		gapSize: 1,
	});
	
	line1 = new THREE.Line(geo, matLineBasic);
	line1.computeLineDistances();
	line1.visible = true;
	
	const lod = new THREE.LOD();
	
	lod.addLevel(line, 20);
	lod.addLevel(line1, 20);
	
	scene.add(lod);
	lod.rotation.x = -Math.PI / 2;
	
	window.addEventListener('resize', onWindowResize);
	onWindowResize();
	
	stats = new Stats();
	// document.body.appendChild(stats.dom);
	
	gpuPanel = new GPUStatsPanel(renderer.getContext());
	stats.addPanel(gpuPanel);
	stats.showPanel(0);
	
	animate();
}

// Water surface
function createGrid () {
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

export function setSelectedSceneName(newName) {
	selectedSceneName = newName;
	// Store cookie
	document.cookie = `selectedSceneName=${newName}`;
}

/**
 * Look for the selected scene name in the cookie, then in the variable
 * @returns {string}
 */
export function getSelectedSceneName() {
	// Attempt to get the scene name from the cookie
	const cookieSceneName = getCookie('selectedSceneName');
	if (cookieSceneName) {
		return cookieSceneName;
	}
	
	// Fallback to the selectedSceneName variable or the first key from sceneActions
	return selectedSceneName || Object.keys(sceneActions).shift();
}

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		let cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i].trim();
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}
