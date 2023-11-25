export default function drawGraph(
  xArray,
  yArray,
  minStroke,
  maxStroke,
  lastIndex,
  marineLifeBehaviourData
) {
  // Define Data
  const data = [
    {
      x: xArray,
      y: yArray,
      mode: "markers",
    },
  ];

  // Define Layout
  const layout = {
    xaxis: {
      range: [
        Number(marineLifeBehaviourData[0].Seconds) / 60,
        Number(marineLifeBehaviourData[lastIndex].Seconds) / 60,
      ],
      title: "Time [min of dive]",
    },
    yaxis: {
      range: [Number(minStroke.Stroke_Rate), Number(maxStroke.Stroke_Rate)],
      // title: "Stroke rate (spm)",
    },
  };

  return { data: data, layout: layout };
}
