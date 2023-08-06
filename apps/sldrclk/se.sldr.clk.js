//var locale = require("locale");
/* jshint esversion: 6 */

/* Preamble */

// Load fonts
const mainTimeFont = "7x11Numeric7Seg";
require("Font7x11Numeric7Seg").add(Graphics);
const extraTimeFont = "5x7Numeric7Seg";
require("Font5x7Numeric7Seg").add(Graphics);
const mainOtherFont = "6x8";
const extraOtherFont = "4x6";

// Positioning blocks
// Bangle 2 viewport is 176x176
const dmax = 176
const padding = 4;
// The slow clock sits dead center on the vertical axis and acts as the layout root
const slowClockPos = [(dmax - 70 - 14) / 2, (dmax - 22) / 2]; // element is 70x22
const fastClockPos = [slowClockPos[0] + 70, dmax / 2]; // element is 14x11
const datePos = [(dmax - 50) / 2, slowClockPos[1] - padding - 7]; // element is 50x7
const timestampPos = [datePos[0], slowClockPos[1] + 22 + padding]; // element is 50x7
const tzPos = [(dmax - 40) / 2, (dmax - 7 - padding)]; // element is 40x8
const dateLinePos = [49, tzPos[1] - padding - 8]; // element is 78x8

console.log([slowClockPos, fastClockPos, datePos, timestampPos, tzPos, dateLinePos]);

// Create minute ticker
var minute = 0;

// TODO
// Percent of Day
// Percent of Year
// Moon cycle
// Battery status
// Connection status
// Temperature
// Heart rate
// Wind (Direction and speed)

/* Business logic block */

function drawSlowClock(d) {
  // Time math
  var h = d.getHours(), m = d.getMinutes();
  var time = h.toString().padStart(2, 0) + ":" + m.toString().padStart(2, 0);
  // Reset the graphics
  g.reset();
  // Draw the time
  g.setFont(mainTimeFont, 2);
  g.drawString(time, slowClockPos[0], slowClockPos[1], true);
}

function drawFastClock(d) {
  // Time math
  var s = d.getSeconds();
  var time = s.toString().padStart(2, 0)
  // Reset the graphics
  g.reset();
  // Draw the time
  g.setFont(mainTimeFont);
  g.drawString(time, fastClockPos[0], fastClockPos[1], true);
}

function drawDate(d) {
  // Time math
  var y = d.getFullYear();
  var m = d.getMonth();
  var a = d.getDate();
  var time = y.toString() + "-" + m.toString().padStart(2, 0) + "-" + a.toString().padStart(2, 0);
  // Reset the graphics
  g.reset();
  // Draw the time
  g.setFont(extraTimeFont);
  g.drawString(time, datePos[0], datePos[1], true);
}

function drawTimestamp(d) {
  // Time math
  var t = Math.floor(d.getTime() / 1000);
  var time = t.toString();
  // Reset the graphics
  g.reset();
  // Draw the time
  g.setFont(extraTimeFont);
  g.drawString(time, timestampPos[0], timestampPos[1], true);
}

function drawTZ(d) {
  // Time math
  var time = d.toString().split(" ").reverse()[0].replace("GMT", "UTC");
  // Reset the graphics
  g.reset();
  // Draw the time
  g.setFont(mainOtherFont);
  g.drawString(time, tzPos[0], tzPos[1], true);
}

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

/* Battery economy block */

function drawFast(d) {
  drawFastClock(d);
  drawTimestamp(d);
}

function drawSlow(d) {
  drawSlowClock(d);
  drawDate(d);
  drawTZ(d);
  drawDateLine(d);
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

// function format2d1f(n) {
//   s = n.toString();
//   if (n < 10) {
//     s = "00" + s;
//   }
//   else if (n < 100) {
//     s = "0" + s;
//   }
//   s = s.substring(0, 2) + "." + s[2];
//   return s
// }

// function getPoD(d) {
//   // We can safely assume a day is 24 hours
//   var startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
//   var pod = Math.floor((d - startOfDay) / (60 * 60 * 24));
//   return format2d1f(pod);
// }

// function getPoY(d) {
//   // We can't safely assume that a year is 365 days, so figure that out first
//   var startOfYear = new Date(d.getFullYear(), 0, 1);
//   var endOfYear = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
//   var lengthOfYear = endOfYear - startOfYear;
//   var poy = Math.floor(((d - startOfYear) * 1000) / lengthOfYear);
//   return format2d1f(poy);
// }

// function drawSimpleClock() {
//   // get date
//   var d = new Date();
//   var da = d.toString().split(" ");
//   var dutc = getUTCTime(d);

//   // Draw percent passed of day and year
//   g.setFont(font, smallFontSize);
//   g.drawString(`pod:${getPoD(d)}% poy:${getPoY(d)}%`, xyCenter, yposPoD, true);

//   // Draw phase of the moon
//   g.setFont(font, smallFontSize);
//   g.drawString(`m:${getMoonPhase(d)}`, xyCenter, yposMoon, true);
// }
