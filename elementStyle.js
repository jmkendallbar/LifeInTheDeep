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
  zoomInBtn,
  zoomOutBtn,
} from "./main";

export default function elementStyle() {
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
  minuteEle.style.bottom = "320px";
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
  stateEle.style.top = "220px";
  stateEle.style.left = "60px";
  stateEle.style.color = "#000";
  stateEle.style.fontSize = "20px";
  stateEle.style.fontFamily = "system-ui";
  stateEle.style.backgroundColor = "#4f7942";
  stateEle.style.borderRadius = "46px";
  stateEle.style.paddingTop = "16px";
  stateEle.style.paddingBottom = "16px";
  stateEle.style.paddingLeft = "30px";
  stateEle.style.paddingRight = "30px";
  stateEle.style.border = "4px solid #000";

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

  // zoom in button
  zoomInBtn.type = "button";
  zoomInBtn.innerText = "+";
  zoomInBtn.style.position = "absolute";
  zoomInBtn.style.width = "40px";
  zoomInBtn.style.height = "30px";
  zoomInBtn.style.borderRadius = "8px";
  zoomInBtn.style.bottom = "16px";
  zoomInBtn.style.left = "350px";
  zoomInBtn.style.color = "#000";
  zoomInBtn.style.cursor = "pointer";
  zoomInBtn.style.fontFamily = "system-ui";
  zoomInBtn.style.border = "1px solid #fff";

  // zoom out button
  zoomOutBtn.type = "button";
  zoomOutBtn.innerText = "-";
  zoomOutBtn.style.position = "absolute";
  zoomOutBtn.style.width = "40px";
  zoomOutBtn.style.height = "30px";
  zoomOutBtn.style.borderRadius = "8px";
  zoomOutBtn.style.bottom = "16px";
  zoomOutBtn.style.left = "300px";
  zoomOutBtn.style.color = "#000";
  zoomOutBtn.style.cursor = "pointer";
  zoomOutBtn.style.fontFamily = "system-ui";
  zoomOutBtn.style.border = "1px solid #fff";
}
