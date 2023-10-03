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
  // document.body.appendChild(zoomInBtn);
  // document.body.appendChild(zoomOutBtn);
}
