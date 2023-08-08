//var locale = require("locale");
/* jshint esversion: 6 */

/* Preamble */

// Get storage access
const storage = require("Storage");

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
require("Font5x7Numeric7Seg").add(Graphics);

// Moon math
const lunation = (29 * 1440) + (12 * 60) + 44;
const knownNew = new Date("2022-01-02T19:33:00");

// Positioning blocks
// Bangle 2 viewport is 176x176
const dmax = 176;
const padding = 4;

// Component configurations
const slowClockCfg = {
  element: {
    main: {
      font: "7x11Numeric7Seg",
      scale: 3,
      template: "00:00"
    }
  }
};
const fastClockCfg = {
  element: {
    main: {
      font: "7x11Numeric7Seg",
      scale: 2,
      template: "00"
    }
  }
};
const iso8601Cfg = {
  element: {
    main: {
      font: "5x7Numeric7Seg",
      scale: 2,
      template: "0000-00-00"
    }
  }
}
const timestampCfg = {
  element: {
    main: {
      font: "7x11Numeric7Seg",
      scale: 1,
      template: "0000000000"
    }
  }
}
const timezoneCfg = {
  element: {
    main: {
      font: "6x8",
      scale: 1,
      template: "UTC+0000"
    }
  }
}
const pLineCfg = {
  element: {
    pOfDH: {
      font: "4x6",
      scale: 1,
      template: "POD:"
    },
    pOfD: {
      font: "6x8",
      scale: 1,
      template: "00.0%",
      xNudge: -padding,
    },
    pOfYH: {
      font: "4x6",
      scale: 1,
      template: "POY:"
    },
    pOfY: {
      font: "6x8",
      scale: 1,
      template: "00.0%",
      xNudge: -padding,
    },
  }
}
const dateInfoCfg = {
  element: {
    dH: {
      font: "4x6",
      scale: 1,
      template: "D:"
    },
    d: {
      font: "6x8",
      scale: 1,
      template: "MON",
      xNudge: -padding,
    },
    mdH: {
      font: "4x6",
      scale: 1,
      template: "MD:"
    },
    md: {
      font: "6x8",
      scale: 1,
      template: "31",
      xNudge: -padding,
    },
    wH: {
      font: "4x6",
      scale: 1,
      template: "W:"
    },
    w: {
      font: "6x8",
      scale: 1,
      template: "00",
      xNudge: -padding,
    },
  }
}
const healthCfg = {
  element: {
    hrH: {
      font: "4x6",
      scale: 1,
      template: "HR:"
    },
    hr: {
      font: "6x8",
      scale: 1,
      template: "000",
      xNudge: -padding,
    },
    stepH: {
      font: "4x6",
      scale: 1,
      template: "S:"
    },
    step: {
      font: "6x8",
      scale: 1,
      template: "00000",
      xNudge: -padding,
    },
  }
}
const deviceStatusCfg = {
  element: {
    con: {
      font: "6x8",
      scale: 1,
      template: "*"
    },
    bat: {
      font: "6x8",
      scale: 1,
      template: "000%"
    }
  }
}
const weatherConf = {
  element: {
    tH: {
      font: "4x6",
      scale: 1,
      template: "T:"
    },
    t: {
      font: "6x8",
      scale: 1,
      template: "-00C(000)",
      xNudge: -padding
    },
    wH: {
      font: "4x6",
      scale: 1,
      template: "W:"
    },
    w: {
      font: "6x8",
      scale: 1,
      template: "00.0[XXX]",
      xNudge: -padding
    },
    hH: {
      font: "4x6",
      scale: 1,
      template: "H:"
    },
    h: {
      font: "6x8",
      scale: 1,
      template: "000%",
      xNudge: -padding
    },
  }
}
const moonCfg = {
  element: {
    moonH: {
      font: "4x6",
      scale: 1,
      template: "M:"
    },
    moon: {
      font: "6x8",
      scale: 1,
      template: "00.0%[XXX]",
      xNudge: -padding,
    }
  }
}

// Sizing math - it got too annoying to do by hand

// Calculate the max Y and total X size of a given component. Since only rows will be
// laid out, the total Y size will just be the largest Y encountered.
var deriveAllXSizes = function (cfg) {
  var tx = 0, ty = 0, elements = 0;
  for (var k of Object.keys(cfg.element)) {
    g.setFont(cfg.element[k].font, cfg.element[k].scale);
    var w = g.stringWidth(cfg.element[k].template);
    var h = g.getFontHeight();
    tx += w;
    if (cfg.element[k].xNudge) tx += cfg.element[k].xNudge;
    if (h > ty) ty = h;
    elements += 1;
    cfg.element[k].size = { x: w, y: h };
  }
  tx += padding * (elements - 1);
  cfg.size = { x: tx, y: ty };
};

deriveAllXSizes(slowClockCfg);
deriveAllXSizes(fastClockCfg);
deriveAllXSizes(iso8601Cfg);
deriveAllXSizes(timestampCfg);
deriveAllXSizes(timezoneCfg);
deriveAllXSizes(pLineCfg);
deriveAllXSizes(dateInfoCfg);
deriveAllXSizes(healthCfg);
deriveAllXSizes(deviceStatusCfg);
deriveAllXSizes(weatherConf);
deriveAllXSizes(moonCfg);

// Positioning math
slowClockCfg.pos = {
  x: (dmax - slowClockCfg.size.x - fastClockCfg.size.x) / 2,
  y: (dmax - slowClockCfg.size.y) / 2
};
fastClockCfg.pos = {
  x: slowClockCfg.pos.x + slowClockCfg.size.x,
  y: slowClockCfg.pos.y + slowClockCfg.size.y - fastClockCfg.size.y
};
iso8601Cfg.pos = {
  x: (dmax - iso8601Cfg.size.x) / 2,
  y: slowClockCfg.pos.y - padding - iso8601Cfg.size.y
};
timestampCfg.pos = {
  x: (dmax - timestampCfg.size.x) / 2,
  y: slowClockCfg.pos.y + slowClockCfg.size.y + padding,
};
timezoneCfg.pos = {
  x: (dmax - timezoneCfg.size.x) / 2,
  y: dmax - padding - timezoneCfg.size.y
}
pLineCfg.pos = {
  x: (dmax - pLineCfg.size.x) / 2,
  y: timezoneCfg.pos.y - padding - pLineCfg.size.y,
}
dateInfoCfg.pos = {
  x: (dmax - dateInfoCfg.size.x) / 2,
  y: pLineCfg.pos.y - padding - dateInfoCfg.size.y
}
healthCfg.pos = {
  x: padding,
  y: padding
}
deviceStatusCfg.pos = {
  x: dmax - padding - deviceStatusCfg.size.x,
  y: padding
}
weatherConf.pos = {
  x: (dmax - weatherConf.size.x) / 2,
  y: deviceStatusCfg.pos.y + deviceStatusCfg.size.y + padding,
}
moonCfg.pos = {
  x: (dmax - moonCfg.size.x) / 2,
  y: weatherConf.pos.y + weatherConf.size.y + padding,
}

// Calculate absolute position of elements
var deriveAllPositions = function (cfg) {
  var x = cfg.pos.x, element = 0;
  for (var k of Object.keys(cfg.element)) {
    if (element > 0) x += padding;
    var y = cfg.pos.y;
    if (cfg.element[k].size.y < cfg.size.y) y += (cfg.size.y - cfg.element[k].size.y);
    if (cfg.element[k].xNudge) x += cfg.element[k].xNudge;
    cfg.element[k].pos = { x: x, y: y };
    x += cfg.element[k].size.x;
    element += 1;
  }
}

deriveAllPositions(slowClockCfg);
deriveAllPositions(fastClockCfg);
deriveAllPositions(iso8601Cfg);
deriveAllPositions(timestampCfg);
deriveAllPositions(timezoneCfg);
deriveAllPositions(pLineCfg);
deriveAllPositions(dateInfoCfg);
deriveAllPositions(healthCfg);
deriveAllPositions(deviceStatusCfg);
deriveAllPositions(weatherConf);
deriveAllPositions(moonCfg);

// console.log("Configurations: " +
//   JSON.stringify({
//     slowClock: slowClockCfg,
//     fastClock: fastClockCfg,
//     iso8601: iso8601Cfg,
//     timestamp: timestampCfg,
//     timezone: timezoneCfg,
//     pLine: pLineCfg,
//     dateInfo: dateInfoCfg,
//     health: healthCfg,
//     deviceStatus: deviceStatusCfg,
//     weather: weatherConf,
//     moon: moonCfg
//   }, null, 2));

// Create minute ticker
var minute = 0;

/* Utility functions block */

function calcWeekNo(d) {
  // Define a new date that's in UTC
  var dUTC = new Date(d - (d.getTimezoneOffset() * 60 * 1000));
  // Redefine that date again, but at midnight
  var dMidnight = new Date(dUTC.getFullYear(), dUTC.getMonth(), dUTC.getDate());
  // Set the day to the nearest Thursday (current date + 4 - current day number)
  dMidnight.setDate(dMidnight.getDate() + 4 - (dMidnight.getDay() || 7));
  // Define the start of the year
  var dYearStart = new Date(dMidnight.getFullYear(), 0, 1);
  var weekNo = Math.ceil((((dMidnight - dYearStart) / 86400000) + 1) / 7);
  return weekNo;
}

function renderPercent(v) {
  v = (v / 10).toFixed(1);
  var t = v.toString().padStart(4, 0) + "%";
  if (v == 100) t = "100 %";
  return t;
}

function getSteps() {
  var steps = 0;
  try {
    if (WIDGETS.wpedom !== undefined) {
      steps = WIDGETS.wpedom.getSteps();
    } else if (WIDGETS.activepedom !== undefined) {
      steps = WIDGETS.activepedom.getSteps();
    } else {
      steps = Bangle.getHealthStatus("day").steps;
    }
  } catch (ex) {
  }

  return steps;
}

// TODO
// Variable abstraction

/* Main drawing block */

var drawString = function (txt, cfg) {
  // Reset the graphics
  g.reset();
  // Draw the time
  g.setFont(cfg.font, cfg.scale);
  g.drawString(txt, cfg.pos.x, cfg.pos.y, true);
}

var drawComponent = function (txts, cfg) {
  for (var k of Object.keys(cfg.element)) {
    drawString(txts[k], cfg.element[k]);
  }
}

function drawSlowClock(d) {
  var h = d.getHours(), m = d.getMinutes();
  var time = h.toString().padStart(2, 0) + ":" + m.toString().padStart(2, 0);
  drawComponent({ main: time }, slowClockCfg);
}

function drawFastClock(d) {
  var s = d.getSeconds();
  var time = s.toString().padStart(2, 0)
  drawComponent({ main: time }, fastClockCfg);
}

function drawISO8601(d) {
  var y = d.getFullYear();
  var m = d.getMonth() + 1;
  var a = d.getDate();
  var time = y.toString() + "-" + m.toString().padStart(2, 0) + "-" + a.toString().padStart(2, 0);
  drawComponent({ main: time }, iso8601Cfg);
}

function drawTimestamp(d) {
  var t = Math.floor(d.getTime() / 1000);
  var time = t.toString();
  drawComponent({ main: time }, timestampCfg);
}

function drawTZ(d) {
  var time = d.toString().split(" ").reverse()[0].replace("GMT", "UTC");
  drawComponent({ main: time }, timezoneCfg);
}

function drawDateInfoLine(d) {
  var day = d.toString().split(" ")[0].toUpperCase();
  var dom = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  var week = calcWeekNo(d).toString().padStart(2, 0);
  drawComponent(
    {
      dH: dateInfoCfg.element.dH.template,
      d: day,
      mdH: dateInfoCfg.element.mdH.template,
      md: dom,
      wH: dateInfoCfg.element.wH.template,
      w: week
    }, dateInfoCfg);
}

function drawPercentLine(d) {
  var dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  var fracOfD = Math.floor((d - dayStart) / 86400);
  var pOfD = renderPercent(fracOfD);
  var yearStart = new Date(d.getFullYear(), 0, 1);
  var yearEnd = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
  var yearLength = yearEnd - yearStart;
  var fracOfY = Math.floor((d - yearStart) * 1000 / yearLength);
  var pOfY = renderPercent(fracOfY);
  drawComponent(
    {
      pOfDH: pLineCfg.element.pOfDH.template,
      pOfD: pOfD,
      pOfYH: pLineCfg.element.pOfYH.template,
      pOfY: pOfY
    }, pLineCfg);
}

function drawHealth() {
  var bpm = Math.round(Bangle.getHealthStatus().bpm || Bangle.getHealthStatus("last").bpm);
  bpm = bpm.toString().padStart(3, 0);
  var steps = getSteps();
  steps = steps.toString().padStart(5, 0);
  drawComponent(
    {
      hrH: healthCfg.element.hrH.template,
      hr: bpm,
      stepH: healthCfg.element.stepH.template,
      step: steps
    }, healthCfg);
}

function drawDeviceStatus() {
  var bat = (E.getBattery() + "%").padStart(4, " ");
  var con = NRF.getSecurityStatus().connected ? " " : deviceStatusCfg.element.con.template;
  drawComponent({ con: con, bat: bat }, deviceStatusCfg);
}

function drawWeather() {
  var weather, tempString = " ? ", windString = " ? ", humidityString = " ? ";
  try {
    var weatherStore = storage.readJSON('weather.json');
    weather = weatherStore.weather;

    // Debugging weather
    // weather = {
    //   "temp": 289, "hi": 291, "lo": 286, "hum": 98, "rain": 0,
    //   "uv": 0, "code": 300, "txt": "Light rain", "wind": 14,
    //   "wdir": 248, "loc": "Gothenburg",
    //   "time": 1691426008012.78686523437, "wrose": "w"
    // };

    var tempK = weather.temp;
    var tempC = Math.round(tempK - 273.15);
    tempString = (function () {
      var s = "";
      s += (tempC < 0) ? "-" : " ";
      var c = Math.abs(tempC);
      s += c.toString().padStart(2, 0);
      s += "C[" + tempK + "]";
      return s;
    })();

    var windSpeed = (weather.wind / 3.6).toFixed(1);
    var windAngle = weather.wdir;
    var windRose = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
    ][Math.floor((windAngle + 11.25) / 22.5)];
    windString = windSpeed.padStart(4, 0) + "[" + windRose + "]";

    var humidity = weather.hum;
    humidityString = humidity.toString().padStart(2, 0).padStart(3, " ") + "%";
  } catch (e) {
    console.log("Error reading weather!");
  }

  drawComponent(
    {
      tH: weatherConf.element.tH.template,
      t: tempString,
      wH: weatherConf.element.wH.template,
      w: windString,
      hH: weatherConf.element.hH.template,
      h: humidityString
    },
    weatherConf
  );
}

function drawMoon(d) {
  // Get millisecond difference between now and the known new moon, divide that down to
  // minutes, then into cycles.
  var cycle = (((d.getTime() - knownNew.getTime()) / 60000) / lunation);
  // Extract the decimal component, and multiply back to get minutes since the last new
  // moon.
  var lunationFrac = (cycle % 1);
  var minSinceNew = lunationFrac * lunation;
  // console.log("Period: " + minSinceNew);
  // console.log("Lunation fraction: " + lunationFrac);
  // Calculate sinusoidal point of the cycle
  var sineMoon = ((-1 * Math.cos(lunationFrac * Math.PI * 2)) + 1) / 2;
  // console.log("Sine moon: " + sineMoon);
  // Permil of cycle
  var cyclePermil = Math.round(sineMoon * 1000);
  var moonPercent = renderPercent(cyclePermil);
  // Set the descriptor
  var descriptor = "NEW";
  if ((lunationFrac > 0.025 && lunationFrac < 0.225) ||
    (lunationFrac > 0.275 && lunationFrac < 0.475)) {
    descriptor = "WAX";
  } else if (lunationFrac >= 0.225 && lunationFrac <= 0.275) {
    descriptor = "Q:1";
  } else if (lunationFrac >= 0.475 && lunationFrac <= 0.525) {
    descriptor = " F ";
  } else if ((lunationFrac > 0.525 && lunationFrac < 0.725) ||
    (lunationFrac > 0.775 && lunationFrac < 0.975)) {
    descriptor = "WAN";
  } else if (lunationFrac >= 0.725 && lunationFrac <= 0.775) {
    descriptor = "Q:3";
  }

  var moon = moonPercent + "[" + descriptor + "]";

  drawComponent({ moonH: moonCfg.element.moonH.template, moon: moon }, moonCfg);
}

/* Battery economy block */

function drawFast(d) {
  drawFastClock(d);
  drawTimestamp(d);
}

function drawSlow(d) {
  drawSlowClock(d);
  drawISO8601(d);
  drawTZ(d);
  drawDateInfoLine(d);
  drawPercentLine(d);
  drawHealth();
  drawDeviceStatus();
  drawWeather();
  drawMoon(d);
}

function drawLoop() {
  // Time math
  // var d = new Date(2020, 11, 31, 23, 59, 59, 999);
  var d = new Date();
  var m = d.getMinutes();
  // Check if we should update the slow elements
  if (m != minute) {
    // console.log("Doing slow updates!");
    minute = m;
    drawSlow(d);
  }
  // Update the fast elements
  drawFast(d);
}

// Short circuit time magic for initialization
function drawAll() {
  var d = new Date();
  drawSlow(d);
  drawFast(d);
}

/* Clock integration block */

// Clear the screen on load
g.clear();

// Create the main timer
var timer = setInterval(drawLoop, 500);

// Handle the LCD being off
Bangle.on('lcdPower', on => {
  // Destroy and reset the timer if it exists
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
  if (on) {
    timer = setInterval(drawLoop, 500);
    drawAll();
  }
});

// Define ourselves as a clock
Bangle.setUI("clock");

// Finally, init and draw all.
drawAll();
