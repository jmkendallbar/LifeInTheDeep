// import {
//   sealBehaviourData,
//   rangeSlider,
//   frequency,
//   stateEle,
//   heartInnerText,
//   strokeInnerText,
//   minuteEle,
//   depthEle,
//   isStart,
//   prevValue,
//   glideAction,
//   idleAction,
//   swimAction,
// } from "./main";
// import { prepareCrossFade } from "./utils";

// export default function currentStatus() {
//   const currentState =
//     sealBehaviourData[Number(rangeSlider.value) * Number(frequency)];
//   const prevState =
//     sealBehaviourData[Number(prevValue.prevValue) * Number(frequency)];
//   stateEle.innerText = currentState?.Simple_Sleep_Code;
//   heartInnerText.innerText = `${Number(currentState.Heart_Rate)?.toFixed(
//     2
//   )}bpm`;
//   strokeInnerText.innerText = `${Number(currentState.Stroke_Rate)?.toFixed(
//     2
//   )}spm`;
//   minuteEle.innerText = `MINUTES INTO DIVE ${currentState.Seconds.toString().toHHMMSS()}`;
//   depthEle.innerText = `DEPTH ${Number(currentState["Depth"])?.toFixed(2)}m`;
//   if (!isStart.start) {
//     if (currentState.Simple_Sleep_Code === "REM") {
//       if (
//         prevState.Simple_Sleep_Code === "SWS" ||
//         prevState.Simple_Sleep_Code === "Quiet Waking"
//       ) {
//         prepareCrossFade(glideAction, idleAction, 1.0);
//       } else if (prevState.Simple_Sleep_Code === "Active Waking") {
//         prepareCrossFade(swimAction, idleAction, 1.0);
//       }
//     }
//     if (
//       currentState.Simple_Sleep_Code === "SWS" ||
//       currentState.Simple_Sleep_Code === "Quiet Waking"
//     ) {
//       if (prevState.Simple_Sleep_Code === "REM") {
//         prepareCrossFade(idleAction, glideAction, 1.0);
//       } else if (prevState.Simple_Sleep_Code === "Active Waking") {
//         prepareCrossFade(swimAction, glideAction, 1.0);
//       }
//     }
//     if (currentState.Simple_Sleep_Code === "Active Waking") {
//       if (prevState.Simple_Sleep_Code === "REM") {
//         prepareCrossFade(idleAction, swimAction, 1.0);
//       } else if (
//         prevState.Simple_Sleep_Code === "SWS" ||
//         prevState.Simple_Sleep_Code === "Quiet Waking"
//       ) {
//         prepareCrossFade(glideAction, swimAction, 1.0);
//       }
//     }
//   } else if (isStart.start) {
//     if (currentState.Simple_Sleep_Code === "Active Waking") {
//       prepareCrossFade(glideAction, swimAction, 1.0);
//     } else if (currentState.Simple_Sleep_Code === "REM") {
//       prepareCrossFade(glideAction, idleAction, 1.0);
//     }
//     isStart.start = false;
//   }
//   prevValue.prevValue = rangeSlider.value;
// }
