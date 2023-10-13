import {
  strokeEle,
  strokeInnerText,
  heartEle,
  heartInnerText,
  rangeSlider,
  confirmDuration,
  minuteEle,
  depthEle,
  stateEle,
  playSpeedBtn,
  depthInnerText,
  minuteInnerText,
  pitchEle,
  pitchInnerText,
  rollEle,
  rollInnerText,
  headEle,
  headInnerText,
} from "./main";

export default function elementStyle() {
  // stroke span
  strokeEle.textContent = "STROKE RATE";
  strokeEle.style.position = "absolute";
  strokeEle.style.bottom = "200px";
  strokeEle.style.right = "80px";
  strokeEle.style.color = "#fff";
  strokeEle.style.fontFamily = "system-ui";
  strokeEle.style.fontSize = "20px";

  // stroke data
  strokeInnerText.textContent = "0 spm";
  strokeInnerText.style.position = "absolute";
  strokeInnerText.style.bottom = "170px";
  strokeInnerText.style.right = "80px";
  strokeInnerText.style.color = "#fff";
  strokeInnerText.style.fontSize = "24px";
  strokeInnerText.style.fontFamily = "system-ui";

  // heart span
  heartEle.textContent = "HEART RATE";
  heartEle.style.position = "absolute";
  heartEle.style.bottom = "126px";
  heartEle.style.right = "80px";
  heartEle.style.fontSize = "20px";
  heartEle.style.color = "#fff";
  heartEle.style.fontFamily = "system-ui";

  // heart data
  heartInnerText.textContent = "36 bpm";
  heartInnerText.style.position = "absolute";
  heartInnerText.style.color = "#fff";
  heartInnerText.style.bottom = "96px";
  heartInnerText.style.right = "80px";
  heartInnerText.style.fontSize = "24px";
  heartInnerText.style.fontFamily = "system-ui";

  // rangeSlider
  rangeSlider.style.position = "absolute";
  rangeSlider.style.width = "90%";
  rangeSlider.style.bottom = "60px";
  rangeSlider.style.left = "60px";
  rangeSlider.style.height = "20px";
  rangeSlider.style.cursor = "pointer";
  rangeSlider.setAttribute("type", "range");
  rangeSlider.id = "slider-range";

  // confirm duration button
  confirmDuration.style.color = "#000";
  confirmDuration.style.width = "100px";
  confirmDuration.style.height = "40px";
  confirmDuration.style.border = "1px solid #fff";
  confirmDuration.style.borderRadius = "8px";
  confirmDuration.style.cursor = "pointer";
  confirmDuration.style.fontWeight = "600";
  confirmDuration.style.color = "#fff";
  confirmDuration.style.backgroundColor = "#3264FE";

  // MINUTE ELEMENT
  minuteEle.textContent = "MINUTES INTO DIVE";
  minuteEle.style.position = "absolute";
  minuteEle.style.width = "160px";
  minuteEle.style.bottom = "150px";
  minuteEle.style.left = "60px";
  minuteEle.style.color = "#fff";
  minuteEle.style.fontSize = "20px";
  minuteEle.style.fontFamily = "system-ui";

  // MINUTE DATA
  minuteInnerText.textContent = "MINUTES INTO DIVE";
  minuteInnerText.style.position = "absolute";
  minuteInnerText.style.width = "160px";
  minuteInnerText.style.bottom = "120px";
  minuteInnerText.style.left = "60px";
  minuteInnerText.style.color = "#fff";
  minuteInnerText.style.fontSize = "24px";
  minuteInnerText.style.fontFamily = "system-ui";

  // DEPTH ELEMENT
  depthEle.textContent = "DEPTH";
  depthEle.style.position = "absolute";
  depthEle.style.top = "228px";
  depthEle.style.right = "80px";
  depthEle.style.color = "#fff";
  depthEle.style.fontSize = "20px";
  depthEle.style.fontFamily = "system-ui";

  // depth data
  depthInnerText.textContent = "196 m";
  depthInnerText.style.position = "absolute";
  depthInnerText.style.top = "252px";
  depthInnerText.style.right = "80px";
  depthInnerText.style.color = "#fff";
  depthInnerText.style.fontSize = "24px";
  depthInnerText.style.fontFamily = "system-ui";

  // DEPTH ELEMENT
  pitchEle.textContent = "Pitch";
  pitchEle.style.position = "absolute";
  pitchEle.style.top = "300px";
  pitchEle.style.right = "80px";
  pitchEle.style.color = "#fff";
  pitchEle.style.fontSize = "20px";
  pitchEle.style.fontFamily = "system-ui";

  // depth data
  pitchInnerText.textContent = "196 m";
  pitchInnerText.style.position = "absolute";
  pitchInnerText.style.top = "320px";
  pitchInnerText.style.right = "80px";
  pitchInnerText.style.color = "#fff";
  pitchInnerText.style.fontSize = "24px";
  pitchInnerText.style.fontFamily = "system-ui";

  // DEPTH ELEMENT
  rollEle.textContent = "Roll";
  rollEle.style.position = "absolute";
  rollEle.style.top = "360px";
  rollEle.style.right = "80px";
  rollEle.style.color = "#fff";
  rollEle.style.fontSize = "20px";
  rollEle.style.fontFamily = "system-ui";

  // depth data
  rollInnerText.textContent = "196 m";
  rollInnerText.style.position = "absolute";
  rollInnerText.style.top = "380px";
  rollInnerText.style.right = "80px";
  rollInnerText.style.color = "#fff";
  rollInnerText.style.fontSize = "24px";
  rollInnerText.style.fontFamily = "system-ui";

  // DEPTH ELEMENT
  headEle.textContent = "Head";
  headEle.style.position = "absolute";
  headEle.style.top = "420px";
  headEle.style.right = "80px";
  headEle.style.color = "#fff";
  headEle.style.fontSize = "20px";
  headEle.style.fontFamily = "system-ui";

  // depth data
  headInnerText.textContent = "196 m";
  headInnerText.style.position = "absolute";
  headInnerText.style.top = "440px";
  headInnerText.style.right = "80px";
  headInnerText.style.color = "#fff";
  headInnerText.style.fontSize = "24px";
  headInnerText.style.fontFamily = "system-ui";

  // State ELEMENT
  stateEle.textContent = "SLEEP STATE ACTIVE WAKING";
  stateEle.style.width = "200px";
  stateEle.style.position = "absolute";
  stateEle.style.textAlign = "center";
  stateEle.style.top = "260px";
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
  playSpeedBtn.style.color = "#000";
  playSpeedBtn.style.cursor = "pointer";
  playSpeedBtn.style.fontFamily = "system-ui";
  playSpeedBtn.style.border = "1px solid #fff";
}
