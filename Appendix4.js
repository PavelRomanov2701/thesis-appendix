const tf = require("@tensorflow/tfjs");
const LogisticRegression = require("./logistic-regression");
const lcjs = require("@arction/lcjs");
const { lightningChart } = lcjs;

// Creating dashboard
const dashboard = lightningChart().Dashboard({
  numberOfColumns: 2,
  numberOfRows: 2,
});

// Creating chart for real-time data
const dataChart = dashboard
  .createChartXY({ columnIndex: 0, rowIndex: 1, columnSpan: 2, rowSpan: 1 })
  .setTitle("Data Chart");

const dataAxisY = dataChart.getDefaultAxisY();
const dataAxisX = dataChart.getDefaultAxisX();
//Setting axis intervals dataAxisX.setInterval(0, 100, true, true) dataAxisY.setInterval(0, 140, true, true)

// Creating chart for probability
const probabilityChart = dashboard
  .createChartXY({ columnIndex: 0, rowIndex: 0, columnSpan: 2, rowSpan: 1 })
  .setTitle("Probability");

const probabilityAxisY = probabilityChart.getDefaultAxisY();
const probabilityAxisX = probabilityChart.getDefaultAxisX();
//Setting axis intervals probabilityAxisX.setInterval(0, 100, true, true) probabilityAxisY.setInterval(-20, 120, true, true)

const probabilitySeries = probabilityChart.addLineSeries();
const dataSeries = dataChart
  .addPointLineSeries()
  //Creating custom table
  .setCursorResultTableFormatter(
    (tableBuilder, pointSeries, x, y, dataPoint) => {
      return tableBuilder
        .addRow(`Iteration: `, "", dataPoint.x.toFixed(0))
        .addRow(`Speed: `, "", dataPoint.y.toFixed(0))
        .addRow(`Temperature: `, "", dataPoint.temperature.toFixed(0));
    }
  );

fetch(document.head.baseURI + "examples/assets/1110/crashData.json")
  .then((r) => r.json())
  .then((data) => {
    const features = [];
    const labels = [];
    // Assigning data to features and labels
    for (let i = 0; i < data.length; i++) {
      features.push([data[i].speed, data[i].temperature]);
      labels.push([data[i].crash]);
    }
    // Creating logistic regression object
    const regression = new LogisticRegression(features, labels, {
      learningRate: 0.5,
      iterations: 10,
      batchSize: 10,
    });

    // Training the model
    regression.train();

    const dataArray = [];

    // Generating random data
    for (let i = 0; i < 100; i++) {
      let speed = Math.round(Math.random() * 100);
      let temp = Math.round(Math.random() * 90 - 40);
      dataArray.push({ x: i, y: speed, temperature: temp });
    }

    run(dataArray);
    // Timer
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    // function that adds new data points to chart and predicts the event
    async function run(dataArray) {
      data = await dataArray;
      for (let i = 0; i < data.length; i++) {
        // Predicting probability of event
        const probability =
          regression.predict([[dataArray[i].y, dataArray[i].temperature]]) *
          100;

        probabilitySeries.add({ x: i, y: probability });
        dataSeries.add(data[i]);
        await timer(500);
      }
    }
  });
