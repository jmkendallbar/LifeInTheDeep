// import { GUI } from "three/addons/libs/lil-gui.module.min.js";
// import { gui, line, line1, matLine, matLineBasic, matLineDashed } from "./main";

// export default function initGui() {
//   gui = new GUI();

//   const param = {
//     "line type": 0,
//     "world units": false,
//     width: 10,
//     alphaToCoverage: true,
//     dashed: true,
//     "dash scale": 1,
//     "dash / gap": 1,
//   };

//   gui
//     .add(param, "line type", { LineGeometry: 0, "gl.LINE": 1 })
//     .onChange(function (val) {
//       switch (val) {
//         case 0:
//           line.visible = true;

//           line1.visible = false;

//           break;

//         case 1:
//           line.visible = false;

//           line1.visible = true;

//           break;
//       }
//     });

//   gui.add(param, "world units").onChange(function (val) {
//     matLine.worldUnits = val;
//     matLine.needsUpdate = true;
//   });

//   gui.add(param, "width", 1, 10).onChange(function (val) {
//     matLine.linewidth = val;
//   });

//   gui.add(param, "alphaToCoverage").onChange(function (val) {
//     matLine.alphaToCoverage = val;
//   });

//   gui.add(param, "dashed").onChange(function (val) {
//     matLine.dashed = val;
//     line1.material = val ? matLineDashed : matLineBasic;
//   });

//   gui.add(param, "dash scale", 0.5, 2, 0.1).onChange(function (val) {
//     matLine.dashScale = val;
//     matLineDashed.scale = val;
//   });

//   gui
//     .add(param, "dash / gap", { "2 : 1": 0, "1 : 1": 1, "1 : 2": 2 })
//     .onChange(function (val) {
//       switch (val) {
//         case 0:
//           matLine.dashSize = 2;
//           matLine.gapSize = 1;

//           matLineDashed.dashSize = 2;
//           matLineDashed.gapSize = 1;

//           break;

//         case 1:
//           matLine.dashSize = 1;
//           matLine.gapSize = 1;

//           matLineDashed.dashSize = 1;
//           matLineDashed.gapSize = 1;

//           break;

//         case 2:
//           matLine.dashSize = 1;
//           matLine.gapSize = 2;

//           matLineDashed.dashSize = 1;
//           matLineDashed.gapSize = 2;

//           break;
//       }
//     });
// }
