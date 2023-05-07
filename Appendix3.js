const LinearRegression = require("./linear-regression");
const lcjs = require("@arction/lcjs");
const { lightningChart, translatePoint } = lcjs;

// Creating dashboard
const dashboard = lightningChart().Dashboard({
  numberOfColumns: 3,
  numberOfRows: 2,
});

const dataChart = dashboard
  .createChartXY({
    columnIndex: 0,
    rowIndex: 0,
    columnSpan: 2,
    rowSpan: 2,
  })
  .setTitle("Data Chart");

const axisY = dataChart.getDefaultAxisY();
const axisX = dataChart.getDefaultAxisX();
// Setting axis intervals axisX.setInterval(0, 500, true, true) axisY.setInterval(0, 3, true, true)

//Creating MSE chart
const MSEchart = dashboard
  .createChartXY({ columnIndex: 2, rowIndex: 0, columnSpan: 1, rowSpan: 1 })
  .setTitle("MSE Chart");

//Crating learning rate chart
const LRchart = dashboard
  .createChartXY({ columnIndex: 2, rowIndex: 1, columnSpan: 1, rowSpan: 1 })
  .setTitle("Learning Rate Chart");

const MSEseries = MSEchart.addLineSeries();
const LRseries = LRchart.addLineSeries();
const dataSeries = dataChart
  .addPointSeries()
  //Creating custom table
  .setCursorResultTableFormatter(
    (tableBuilder, pointSeries, x, y, dataPoint) => {
      return tableBuilder
        .addRow(`Horsepower: `, "", dataPoint.x.toFixed(5))
        .addRow(`Weight: `, "", dataPoint.y.toFixed(5))
        .addRow(`MPG: `, "", dataPoint.mpg.toFixed(5));
    }
  );

fetch(document.head.baseURI + "examples/assets/1110/cars.json")
  .then((r) => r.json())
  .then((data) => {
    const features = [];
    const labels = [];
    // Assigning data to features and labels
    for (let i = 0; i < data.length; i++) {
      features.push([data[i].horsepower, data[i].weight]);
      labels.push([data[i].mpg]);
    }

    // Creating linear regression object
    const regression = new LinearRegression(features, labels, {
      learningRate: 0.1,
      iterations: 10,
      batchSize: 10,
    });

    // Training the model
    regression.train();

    // Getting model properties
    const mse = regression.mseHistory;
    const learningRate = regression.learningRateHistory;
    // Adding data points to MSE and LR charts
    for (let i = 0; i < mse.length; i++) {
      MSEseries.add({ x: i, y: mse[i] });
    }

    for (let i = 0; i < learningRate.length; i++) {
      LRseries.add({ x: i, y: learningRate[i] });
    }

    // Mouse click event
    dataChart.onSeriesBackgroundMouseClick((_, event) => {
      const mouseLocationClient = { x: event.clientX, y: event.clientY };
      // Translate mouse location to LCJS coordinate system for solving data points from series, and translating to Axes.
      const mouseLocationEngine = dataChart.engine.clientLocation2Engine(
        mouseLocationClient.x,
        mouseLocationClient.y
      );

      // Translate mouse location to chart coordinate
      const mouseLocationAxis = translatePoint(
        mouseLocationEngine,
        dataChart.engine.scale,
        {
          x: dataChart.getDefaultAxisX(),
          y: dataChart.getDefaultAxisY(),
        }
      );

      const mouseX = mouseLocationAxis.x;
      const mouseY = mouseLocationAxis.y;
      // Getting prediction
      const prediction = regression.predict([[mouseX, mouseY]]);
      // Adding point with prediction to series
      dataSeries.add({ x: mouseX, y: mouseY, mpg: prediction });
    });
  });
