import {
  strokeEle,
  strokeInnerText,
  heartEle,
  heartInnerText,
  rangeSlider,
  minuteEle,
  depthEle,
  stateEle,
  playSpeedBtn,
  pauseBtn,
  playBtn,
  resetBtn,
  cropBtn,
  depthInnerText,
  minuteInnerText,
  rollEle,
  rollInnerText,
  headInnerText,
  headEle,
  pitchEle,
  pitchInnerText,
  // zoomInBtn,
  // zoomOutBtn,
} from "./main";

export default function appendElement() {
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
  document.body.appendChild(depthInnerText);
  document.body.appendChild(minuteInnerText);
  document.body.appendChild(rollEle);
  document.body.appendChild(headEle);
  document.body.appendChild(pitchEle);
  document.body.appendChild(rollInnerText);
  document.body.appendChild(headInnerText);
  document.body.appendChild(pitchInnerText);
}
