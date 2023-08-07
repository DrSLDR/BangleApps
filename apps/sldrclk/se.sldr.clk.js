//var locale = require("locale");
/* jshint esversion: 6 */

/* Preamble */

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
require("Font5x7Numeric7Seg").add(Graphics);
const mainOtherFont = "6x8";
const extraOtherFont = "4x6";

// Positioning blocks
// Bangle 2 viewport is 176x176
const dmax = 176
const padding = 4;

// Element configurations
const slowClockCfg = {
  font: "7x11Numeric7Seg",
  scale: 2
};
const fastClockCfg = {
  font: "7x11Numeric7Seg",
  scale: 1
};
const iso8601Cfg = {
  font: "5x7Numeric7Seg",
  scale: 1
}
const timestampCfg = {
  font: "5x7Numeric7Seg",
  scale: 1
}
const timezoneCfg = {
  font: "6x8",
  scale: 1
}

// Sizing math - it got too annoying to do by hand
function deriveSize(cfg, str) {
  g.setFont(cfg.font, cfg.scale);
  var h = g.getFontHeight();
  var w = g.stringWidth(str);
  return { x: w, y: h };
}

slowClockCfg.size = deriveSize(slowClockCfg, "00:00");
fastClockCfg.size = deriveSize(fastClockCfg, "00");
iso8601Cfg.size = deriveSize(iso8601Cfg, "0000-00-00");
timestampCfg.size = deriveSize(timestampCfg, "0000000000");
timezoneCfg.size = deriveSize(timezoneCfg, "UTC+0000");

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

console.log("Configurations: " +
  JSON.stringify({
    slowClock: slowClockCfg,
    fastClock: fastClockCfg,
    iso8601: iso8601Cfg,
    timestamp: timestampCfg,
    timezone: timezoneCfg
  }, null, 2));

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
  return t;
}

// TODO
// Moon cycle
// Battery status
// Connection status
// Temperature
// Heart rate
// Wind (Direction and speed)
// Variable abstraction

/* Main drawing block */

function generalDraw(txt, cfg) {
  // Reset the graphics
  g.reset();
  // Draw the time
  g.setFont(cfg.font, cfg.scale);
  g.drawString(txt, cfg.pos.x, cfg.pos.y, true);
}

function drawSlowClock(d) {
  var h = d.getHours(), m = d.getMinutes();
  var time = h.toString().padStart(2, 0) + ":" + m.toString().padStart(2, 0);
  generalDraw(time, slowClockCfg);
}

function drawFastClock(d) {
  var s = d.getSeconds();
  var time = s.toString().padStart(2, 0)
  generalDraw(time, fastClockCfg);
}

function drawISO8601(d) {
  var y = d.getFullYear();
  var m = d.getMonth();
  var a = d.getDate();
  var time = y.toString() + "-" + m.toString().padStart(2, 0) + "-" + a.toString().padStart(2, 0);
  generalDraw(time, iso8601Cfg);
}

function drawTimestamp(d) {
  var t = Math.floor(d.getTime() / 1000);
  var time = t.toString();
  generalDraw(time, timestampCfg);
}

function drawTZ(d) {
  var time = d.toString().split(" ").reverse()[0].replace("GMT", "UTC");
  generalDraw(time, timezoneCfg);
}

function drawDateLine(d) {
  // Time math
  var day = d.toString().split(" ")[0].toUpperCase();
  var dom = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  var week = calcWeekNo(d).toString().padStart(2, 0);
  // Reset the graphics
  g.reset();
  // Draw the day header (8x6)
  g.setFont(extraOtherFont);
  var x = dateLinePos[0], y = dateLinePos[1] + 2;
  g.drawString("D:", x, y, true);
  // Draw the day (18x8)
  x += 8, y -= 2;
  g.setFont(mainOtherFont);
  g.drawString(day, x, y, true);
  // Draw the days in month header (12x6)
  x += (padding + 18), y += 2;
  g.setFont(extraOtherFont);
  g.drawString("MD:", x, y, true);
  // Draw the days in month (12x8)
  x += 12, y -= 2;
  g.setFont(mainOtherFont);
  g.drawString(dom, x, y, true);
  // Draw the week header (8x6)
  x += (padding + 12), y += 2;
  g.setFont(extraOtherFont);
  g.drawString("W:", x, y, true);
  // Draw the week number (12x8)
  x += 8, y -= 2;
  g.setFont(mainOtherFont);
  g.drawString(week, x, y, true);
}

function drawPercentLine(d) {
  // Time math
  var dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  var fracOfD = Math.floor((d - dayStart) / 86400);
  var pOfD = renderPercent(fracOfD);
  var yearStart = new Date(d.getFullYear(), 0, 1);
  var yearEnd = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
  var yearLength = yearEnd - yearStart;
  var fracOfY = Math.floor((d - yearStart) * 1000 / yearLength);
  var pOfY = renderPercent(fracOfY);
  // Reset the graphics
  g.reset();
  // Draw the pod header (16x6)
  g.setFont(extraOtherFont);
  var x = percentLinePos[0], y = percentLinePos[1] + 2;
  g.drawString("POD:", x, y, true);
  // Draw the pod (18x8)
  x += 16, y -= 2;
  g.setFont(mainOtherFont);
  g.drawString(pOfD, x, y, true);
  // Draw the poy header (16x6)
  x += (padding + 18), y += 2;
  g.setFont(extraOtherFont);
  g.drawString("POY:", x, y, true);
  // Draw the poy (18x8)
  x += 16, y -= 2;
  g.setFont(mainOtherFont);
  g.drawString(pOfY, x, y, true);
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
  // drawDateLine(d);
  // drawPercentLine(d);
}

function drawLoop() {
  // Time math
  var d = new Date();
  var m = d.getMinutes();
  // Check if we should update the slow elements
  if (m != minute) {
    console.log("Doing slow updates!");
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

// const moonPeriod = 29.53;
// const moonTime = [
//   0.5,
//   ((moonPeriod / 4) - 0.5),
//   ((moonPeriod / 4) + 0.5),
//   ((moonPeriod / 2) - 0.5),
//   ((moonPeriod / 2) + 0.5),
//   (((3 * moonPeriod) / 4) - 0.5),
//   (((3 * moonPeriod) / 4) + 0.5),
//   (moonPeriod - 0.5)
// ];
// const fixMoon = new Date(2020, 02, 24, 09, 28, 0);

// function getUTCTime(d) {
//   return d.toUTCString().split(' ')[4].split(':').map(function (d) { return Number(d) });
// }

// function getMoonPhase(d) {
//   // Get millisecond difference and divide down to cycles
//   var cycles = (d.getTime() - fixMoon.getTime()) / 1000 / 60 / 60 / 24 / moonPeriod;

//   // Multiply decimal component back into days since new moon
//   var sincenew = (cycles % 1) * moonPeriod;

//   // Derive moon phase
//   var phase = "new";
//   if (sincenew > moonTime[0] && sincenew <= moonTime[1]) {
//     phase = "wx.cr";
//   }
//   else if (sincenew > moonTime[1] && sincenew <= moonTime[2]) {
//     phase = "fst.q";
//   }
//   else if (sincenew > moonTime[2] && sincenew <= moonTime[3]) {
//     phase = "wx.gb";
//   }
//   else if (sincenew > moonTime[3] && sincenew <= moonTime[4]) {
//     phase = "full";
//   }
//   else if (sincenew > moonTime[4] && sincenew <= moonTime[5]) {
//     phase = "wn.gb";
//   }
//   else if (sincenew > moonTime[5] && sincenew <= moonTime[6]) {
//     phase = "lst.q";
//   }
//   else if (sincenew > moonTime[6] && sincenew <= moonTime[7]) {
//     phase = "wn.cr";
//   }

//   return phase;
// }

// function drawSimpleClock() {
//   // get date
//   var d = new Date();
//   var da = d.toString().split(" ");
//   var dutc = getUTCTime(d);

//   // Draw phase of the moon
//   g.setFont(font, smallFontSize);
//   g.drawString(`m:${getMoonPhase(d)}`, xyCenter, yposMoon, true);
// }
