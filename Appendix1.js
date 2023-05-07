const lcjs = require("@arction/lcjs");
const KNN = require("./KNN");
const { lightningChart, PointShape, SolidFill, ColorHEX, translatePoint } =
  lcjs;

// Chart creation
const chart = lightningChart().ChartXY({}).setTitle("KNN classification test");

// Red point series
const redPoints = chart
  .addPointSeries({ pointShape: PointShape.Circle })
  .setPointSize(10)
  .setPointFillStyle(new SolidFill({ color: ColorHEX("#F00") }));

// Blue point series
const bluePoints = chart
  .addPointSeries({ pointShape: PointShape.Triangle })
  .setPointSize(10)
  .setPointFillStyle(new SolidFill({ color: ColorHEX("#344ceb") }));

// Fetch data from fileAppendix 1 shows the code for an application that classifies data points based on their coordinates.
fetch(document.head.baseURI + "examples/assets/0015/testData.json")
  .then((r) => r.json())
  .then((data) => {
    const features = [];
    const labels = [];

    // Assign data to features and labels
    for (let i = 0; i < data.length; i++) {
      if (data[i].color == "red") {
        features.push([data[i].x, data[i].y]);
        labels.push([0]);
        redPoints.add({ x: data[i].x, y: data[i].y });
      } else {
        features.push([data[i].x, data[i].y]);
        labels.push([1]);
        bluePoints.add({ x: data[i].x, y: data[i].y });
      }
    }

    // Object creation
    const testKNN = new KNN(features, labels, 10);

    // Background click event
    chart.onSeriesBackgroundMouseClick((_, event) => {
      const mouseLocationClient = { x: event.clientX, y: event.clientY };
      // Translate mouse location to LCJS coordinate system for solving data points from series, and translating to Axes.
      const mouseLocationEngine = chart.engine.clientLocation2Engine(
        mouseLocationClient.x,
        mouseLocationClient.y
      );

      // Translate mouse location to chart coordinate
      const mouseLocationAxis = translatePoint(
        mouseLocationEngine,
        chart.engine.scale,
        {
          x: chart.getDefaultAxisX(),
          y: chart.getDefaultAxisY(),
        }
      );
      const mouseX = mouseLocationAxis.x;
      const mouseY = mouseLocationAxis.y;

      // Call a KNN method
      const result = testKNN.normalizationKNN([mouseX, mouseY]);

      // Assign result to point series
      if (Math.round(result) == 0) {
        redPoints.add({ x: mouseX, y: mouseY });
      } else {
        bluePoints.add({ x: mouseX, y: mouseY });
      }
    });
  });
