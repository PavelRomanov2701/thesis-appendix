// Import LightningChartJS
const lcjs = require("@arction/lcjs");
const {
  lightningChart,
  ImageFill,
  ImageFitMode,
  translatePoint,
  PointShape,
  SolidFill,
  AutoCursorModes,
  AxisTickStrategies,
} = lcjs;

const tf = require("@tensorflow/tfjs");

const dashboard = lightningChart().Dashboard({
  numberOfColumns: 4,
  numberOfRows: 3,
});

const panel = dashboard.createUIPanel({ columnIndex: 3, rowIndex: 0 });

panel.onResize((chart, width, height, engineWidth, engineHeight) => {
  block.style.left = engineWidth - width + "px";
});
const chart = dashboard
  .createChartXY({ columnIndex: 0, rowIndex: 0, columnSpan: 3, rowSpan: 3 })
  .setTitle("KNN Housing Price Test");

chart
  .getDefaultAxes()
  .forEach((axis) => axis.setTickStrategy(AxisTickStrategies.Empty));

const blockDiv = document.createElement("div");
blockDiv.id = "block";

const sqft_lotText = document.createElement("input");
sqft_lotText.id = "textBox";
sqft_lotText.labels = "slider";
sqft_lotText.value = 4000;
blockDiv.appendChild(sqft_lotText);

const sqft_lotSlider = document.createElement("input");
sqft_lotSlider.type = "range";
sqft_lotSlider.min = 4000;
sqft_lotSlider.max = 30000;
sqft_lotSlider.value = sqft_lotSlider.min;
sqft_lotSlider.id = "slider";
blockDiv.appendChild(sqft_lotSlider);

dashboard.engine.container.append(blockDiv);

const map = dashboard
  .createChartXY({ columnIndex: 3, rowIndex: 1, rowSpan: 2 })
  .setTitle("");
map
  .getDefaultAxes()
  .forEach((axis) => axis.setTickStrategy(AxisTickStrategies.Empty));

const axisY = map.getDefaultAxisY();
const axisX = map.getDefaultAxisX();

const w = 320;
const h = 40;
const zoom = 10;
const lat = 47.5112;
const lng = -122.25;
const apiKey = "Enter Google Maps API key";

// //Function which calculates latitude and longitude coordinates from pixel on map picture.
function getPointLatLng(x, y) {
  const parallelMultiplier = Math.cos((lat * Math.PI) / 180);
  const degreesPerPixelX = 360 / Math.pow(2, zoom + 8);
  const degreesPerPixelY = (360 / Math.pow(2, zoom + 8)) * parallelMultiplier;
  const pointLat = lat - degreesPerPixelY * (y - h / 2);
  const pointLng = lng + degreesPerPixelX * (x - w / 2);
  return { y: pointLat, x: pointLng };
}

axisX.setInterval(getPointLatLng(0, 0).x, getPointLatLng(w, 0).x, true, true);
axisY.setInterval(getPointLatLng(0, h).y, getPointLatLng(0, 0).y, true, true);

// Load image from Google static maps const img = new Image() img.crossOrigin = 'anonymous'
img.src = `https://maps.googleapis.com/maps/api/staticmap language=en&size= {w}x {h}&zoom= {zoom}&center= {lat}, {lng}&key= {apiKey}`;

//Set series background to image.
map.setSeriesBackgroundFillStyle(
  new ImageFill({ source: img, fitMode: ImageFitMode.Stretch })
);

map.onSeriesBackgroundMouseClick((_, event) => {
  const mouseLocationClient = { x: event.clientX, y: event.clientY };
  // Translate mouse location to LCJS coordinate system for solving data points from series, and translating to Axes.
  const mouseLocationEngine = map.engine.clientLocation2Engine(
    mouseLocationClient.x,
    mouseLocationClient.y
  );

  // Translate mouse location to chart coordinate
  const mouseLocationAxis = translatePoint(
    mouseLocationEngine,
    map.engine.scale,
    { x: map.getDefaultAxisX(), y: map.getDefaultAxisY() }
  );
  chart.dispose();
  createMap(mouseLocationAxis.x, mouseLocationAxis.y);
});

function createMap(lng, lat) {
  // Create chart
  const chart = dashboard
    .createChartXY({
      columnIndex: 0,
      rowIndex: 0,
      columnSpan: 3,
      rowSpan: 3,
    })
    .setTitle("KNN Housing Price Test")
    .setMouseInteractionWheelZoom(false)
    .setMouseInteractionRectangleZoom(false);

  // Remove axes
  chart
    .getDefaultAxes()
    .forEach((axis) => axis.setTickStrategy(AxisTickStrategies.Empty));

  // Create point series for predicted points
  const pointSeries = chart
    .addPointSeries({ pointShape: PointShape.Circle })
    .setIndividualPointValueEnabled(true)
    .setPointSize(10)
    .setPointFillStyle(new SolidFill({ color: lcjs.ColorHEX("#fc030b") }))

    // Custom table for predicted points
    .setCursorResultTableFormatter(
      (tableBuilder, pointSeries, x, y, dataPoint) => {
        return tableBuilder
          .addRow(`Lng: `, "", dataPoint.x.toFixed(5))
          .addRow(`Lat: `, "", dataPoint.y.toFixed(5))
          .addRow(`Sqft lot: `, "", dataPoint.sqft_lot)
          .addRow(`Price: `, "", " ", dataPoint.value.toFixed(0));
      }
    );

  //Create point series for original points
  const pointSeriesData = chart
    .addPointSeries({ pointShape: PointShape.Circle })
    .setIndividualPointValueEnabled(true)
    .setPointSize(5)
    .setPointFillStyle(new SolidFill({ color: lcjs.ColorHEX("#32 5a ") }))
    .setCursorResultTableFormatter(
      (tableBuilder, pointSeries, x, y, dataPoint) => {
        return tableBuilder
          .addRow(`Lng: `, "", dataPoint.x.toFixed(5))
          .addRow(`Lat: `, "", dataPoint.y.toFixed(5))
          .addRow(`Sqft lot: `, "", dataPoint.sqft_lot.toFixed(0))
          .addRow(`Sqft living: `, "", dataPoint.sqft_living.toFixed(0))
          .addRow(`Condition: `, "", dataPoint.condition.toFixed(0))
          .addRow(`Price: `, "", " ", dataPoint.value.toFixed(0));
      }
    );

  //Get Google Maps screenshot
  const axisY = chart.getDefaultAxisY();
  const axisX = chart.getDefaultAxisX();

  // Set parameters for Google Map and Chart
  const w = 40;
  const h = 320;
  const zoom = 13;
  const apiKey = "Enter Google Maps API key";

  //Function that calculates latitude and longitude coordinates from pixel on map picture.
  function getPointLatLng(x, y) {
    const parallelMultiplier = Math.cos((lat * Math.PI) / 180);
    const degreesPerPixelX = 360 / Math.pow(2, zoom + 8);
    const degreesPerPixelY = (360 / Math.pow(2, zoom + 8)) * parallelMultiplier;
    const pointLat = lat - degreesPerPixelY * (y - h / 2);
    const pointLng = lng + degreesPerPixelX * (x - w / 2);
    return { y: pointLat, x: pointLng };
  }

  // Apply map parameters for Axes
  axisX.setInterval(getPointLatLng(0, 0).x, getPointLatLng(w, 0).x, true, true);
  axisY.setInterval(getPointLatLng(0, h).y, getPointLatLng(0, 0).y, true, true);

  const longStart = getPointLatLng(0, 0).x;
  const longEnd = getPointLatLng(w, 0).x;
  const latStart = getPointLatLng(0, h).y;
  const latEnd = getPointLatLng(0, 0).y;

  // Load image from Google static maps const img = new Image() img.crossOrigin = 'anonymous'
  img.src = `https://maps.googleapis.com/maps/api/staticmap language=en&size= {w}x {h}&zoom= {zoom}&center= {lat}, {lng}&key= {apiKey}`;

  //Set series background to image.
  chart.setSeriesBackgroundFillStyle(
    new ImageFill({ source: img, fitMode: ImageFitMode.Stretch })
  );

  // Fetch original data
  fetch(document.head.baseURI + "examples/assets/1101/houseData.json")
    .then((r) => r.json())
    .then((data) => {
      sqft_lotSlider.oninput = () => {
        sqft_lotText.value = sqft_lotSlider.value;
      };

      const features = new Array();
      const labels = new Array();

      // Get features and labels from data, add original points to series
      for (let i = 0; i < data.length; i++) {
        if (
          (data[i].lat > latStart) &
          (data[i].lat < latEnd) &
          (data[i].long > longStart) &
          (data[i].long < longEnd)
        ) {
          const featuresArray = [data[i].long, data[i].lat, data[i].sqft_lot];
          const labelsArray = [data[i].price];

          features.push(featuresArray);
          labels.push(labelsArray);

          pointSeriesData.add({
            x: data[i].long,
            y: data[i].lat,
            sqft_lot: data[i].sqft_lot,
            sqft_living: data[i].sqft_living,
            condition: data[i].condition,
            value: data[i].price,
          });
        }
      }

      // Click Event
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
        // Point for KNN
        const testPoint = [
          mouseLocationAxis.x,
          mouseLocationAxis.y,
          sqft_lotText.value,
        ];
        // Predict label and add predicted point to series
        const result = knn(features, labels, testPoint, 20);
        pointSeries.add({
          x: mouseLocationAxis.x,
          y: mouseLocationAxis.y,
          sqft_lot: sqft_lotText.value,
          value: result,
        });
      });
    });
}

//KNN Algorithm
function knn(features, labels, testPoint, k) {
  const normalizedArray = minMax(features, features[0].length, testPoint);
  const tensorFeatures = tf.tensor(normalizedArray[0]);
  const scaledPoint = tf.tensor(normalizedArray[1]);
  const tensorLabels = tf.tensor(labels);

  return (
    tensorFeatures
      // DISTANCE CALCULATION
      .sub(scaledPoint)
      .pow(2)
      .sum(1)
      .pow(0.5)
      // CONCAT FEATURES AND LABELS TOGETHER
      .expandDims(1)
      .concat(tensorLabels, 1)
      // UNSTACK TO A JA ASCRIPT ARRAY
      .unstack()
      // SORT
      .sort((tensorA, tensorB) =>
        tensorA.arraySync()[0] > tensorB.arraySync()[0] ? 1 : -1
      )
      // TAKE TOP K RECORDS
      .slice(0, k)
      // A ERAKE OF K OF LABELS CLOSEST TO THE PREDICTION POINT
      .reduce((acc, pair) => acc + pair.arraySync()[1], 0) / k
  );
}

function minMax(data, featuresCount, point) {
  const dataArr = [];
  for (let i = 0; i < data.length; i++) {
    dataArr.push([]);
  }

  const pointArr = [];

  for (let i = 0; i < featuresCount; i++) {
    const column = (arr, n) => arr.map((row) => row[n]);

    const min = Math.min.apply(Math, column(data, i));
    const max = Math.max.apply(Math, column(data, i));
    pointArr.push((point[i] - min) / (max - min));
    for (let j = 0; j < data.length; j++) {
      dataArr[j].push((data[j][i] - min) / (max - min));
    }
  }
  return [dataArr, pointArr];
}

function addStyle(styleString) {
  const style = document.createElement("style");
  style.textContent = styleString;
  document.head.append(style);
}

addStyle(`

* {
box-sizing: border-box;
}

#block{
width: 500px; height: 0px; top: 5 ; right: -2px;
position: absolute; display: table;
justify-content: space-evenly; padding: 30px 10px;
z-index: 1;
box-sizing: border-box
}

#slider{
-webkit-appearance: none; margin: 0px;
padding: 0;
width: 5 ; height: 5px;
display: table-cell; position: relative; cursor: pointer; border-radius: 10px; border: solid 1px;
background: linear-gradient(to right, #fff 0 , white 100 )
}

#slider::-webkit-slider-thumb{
 


-webkit-appearance: none; height: 20px;
width: 20px; padding: 0;
background-color: lightgray; cursor: pointer;
border-radius: 50 ; border: solid 1px gray
}

#textBox{ margin: 0;
padding: 0;
label for ="slider" display: table-cell; position: relative; left: 0px

}


`);
