var locale = require("locale");
/* jshint esversion: 6 */
const big = g.getWidth()>200;
const timeFontSize = big?4:3;
const dateFontSize = big?3:2;
const smallFontSize = big?2:1;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = 50;
const yposDate = big?85:75;
const yposTst = big?115:95;
const yposDml = big?170:130;
const yposDayMonth = big?195:140;
const yposGMT = big?220:150;

const moonPeriod = 29.53;
const moonTime = [
  0.5,
  ((moonPeriod/4) - 0.5),
  ((moonPeriod/4) + 0.5),
  ((moonPeriod/2) - 0.5),
  ((moonPeriod/2) + 0.5),
  (((3*moonPeriod)/4) - 0.5),
  (((3*moonPeriod)/4) + 0.5),
  (moonPeriod - 0.5)
];

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

function getUTCTime(d) {
  return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d)});
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = newDate(Date.UTC(d.getUTCFullYear(),0,1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

function drawSimpleClock() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");
  var dutc = getUTCTime(d);

  g.reset(); // default draw styles
  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].split(":");
  var hours = time[0],
    minutes = time[1],
    seconds = time[2];

  var meridian = "";
  if (is12Hour) {
    hours = parseInt(hours,10);
    meridian = "AM";
    if (hours == 0) {
      hours = 12;
      meridian = "AM";
    } else if (hours >= 12) {
      meridian = "PM";
      if (hours>12) hours -= 12;
    }
    hours = (" "+hours).substr(-2);
  }

  // Time
  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, yposTime, true);
  g.setFont(font, smallFontSize);
  g.drawString(meridian, xyCenter + 102, yposTime + 10, true);

  // Derive datestrings
  var month = d.getMonth() + 1;
  var sMonth = month.toString();
  if (month < 10){
    sMonth = "0" + sMonth;
  }
  var day = d.getDate();
  var sDay = day.toString();
  if (day < 10){
    sDay = "0" + sDay;
  }

  // Date String
  g.setFont(font, dateFontSize);
  g.drawString(`${d.getFullYear()}-${sMonth}-${sDay}`, xyCenter, yposDate, true);

  // Timestamp
  var tst = Math.floor(d.getTime()/1000);
  g.setFont(font, smallFontSize);
  g.drawString(`tst:${tst}`, xyCenter, yposTst, true);

  //Days in month
  var dom = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();

  // Draw days in month and sime since new moon
  // Draw day of week, days in month, and week number
  g.setFont(font, smallFontSize);
  // g.drawString(`md:${dom} l:${sincenew.toFixed(2)}`, xyCenter, yposDml, true);
  g.drawString(`d:${locale.dow(d,true)} md:${dom} w:${getWeekNumber(d)}`, xyCenter, yposDml, true);

  // Days since full moon
  var knownnew = new Date(2020,02,24,09,28,0);

  // Get millisecond difference and divide down to cycles
  var cycles = (d.getTime()-knownnew.getTime())/1000/60/60/24/moonPeriod;

  // Multiply decimal component back into days since new moon
  var sincenew = (cycles % 1)*moonPeriod;

  // Derive moon phase
  var phase = "new";
  if (sincenew > moonTime[0] && sincenew <= moonTime[1]) {
    phase = "wx.cr";
  }
  else if (sincenew > moonTime[1] && sincenew <= moonTime[2]) {
    phase = "fst.q";
  }
  else if (sincenew > moonTime[2] && sincenew <= moonTime[3]) {
    phase = "wx.gb";
  }
  else if (sincenew > moonTime[3] && sincenew <= moonTime[4]) {
    phase = "full";
  }
  else if (sincenew > moonTime[4] && sincenew <= moonTime[5]) {
    phase = "wn.gb";
  }
  else if (sincenew > moonTime[5] && sincenew <= moonTime[6]) {
    phase = "lst.q";
  }
  else if (sincenew > moonTime[6] && sincenew <= moonTime[7]) {
    phase = "wn.cr";
  }

  // Draw phase of the moon
  g.setFont(font, smallFontSize);
  g.drawString(`m:${phase}`, xyCenter, yposDayMonth, true);

  // draw Month name, Day of the week and beats
  // var beats = Math.floor((((dutc[0] + 1) % 24) + dutc[1] / 60 + dutc[2] / 3600) * 1000 / 24);
  // g.drawString(`m:${locale.month(d,true)} d:${locale.dow(d,true)} @${beats}`, xyCenter, yposDayMonth, true);

  // draw gmt
  var gmt = da[5];
  g.setFont(font, smallFontSize);
  g.drawString(gmt, xyCenter, yposGMT, true);
}

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (on) drawSimpleClock();
});

// clean app screen
g.clear();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();

// refesh every 500 milliseconds
setInterval(drawSimpleClock, 500);

// draw now
drawSimpleClock();
