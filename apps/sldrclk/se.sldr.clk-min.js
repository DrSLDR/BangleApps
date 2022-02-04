var locale=require("locale");const big=g.getWidth()>200,timeFontSize=big?4:3,dateFontSize=big?3:2,smallFontSize=big?2:1,font="6x8",xyCenter=g.getWidth()/2,yposTime=50,yposDate=big?85:75,yposTst=big?115:95,yposDml=big?170:130,yposDayMonth=big?195:140,yposGMT=big?220:150,moonPeriod=29.53,moonTime=[.5,6.8825,7.8825,14.265,15.265,21.6475,22.6475,29.03],fixMoon=new Date(2020,2,24,9,28,0);var is12Hour=(require("Storage").readJSON("setting.json",1)||{})["12hour"];function getUTCTime(e){return e.toUTCString().split(" ")[4].split(":").map((function(e){return Number(e)}))}function getWeekNumber(e){e=new Date(e-60*e.getTimezoneOffset()*1e3),(e=new Date(e.getFullYear(),e.getMonth(),e.getDate())).setDate(e.getDate()+4-(e.getDay()||7));var t=new Date(e.getFullYear(),0,1);return Math.ceil(((e-t)/864e5+1)/7)}function getMoonPhase(e){var t=(e.getTime()-fixMoon.getTime())/1e3/60/60/24/29.53%1*29.53,o="new";return t>moonTime[0]&&t<=moonTime[1]?o="wx.cr":t>moonTime[1]&&t<=moonTime[2]?o="fst.q":t>moonTime[2]&&t<=moonTime[3]?o="wx.gb":t>moonTime[3]&&t<=moonTime[4]?o="full":t>moonTime[4]&&t<=moonTime[5]?o="wn.gb":t>moonTime[5]&&t<=moonTime[6]?o="lst.q":t>moonTime[6]&&t<=moonTime[7]&&(o="wn.cr"),o}function getPoD(e){var t=new Date(e.getFullYear(),e.getMonth(),e.getDate(),0,0,0,0);return Math.round((e-t)/864e3)}function getPoY(e){var t=new Date(e.getFullYear(),0,1),o=new Date(e.getFullYear(),11,31,23,59,59,999)-t;return Math.round(100*(e-t)/o)}function drawSimpleClock(){var e=new Date,t=e.toString().split(" ");getUTCTime(e);g.reset(),g.setFontAlign(0,0);var o=t[4].split(":"),n=o[0],r=o[1],i=o[2],a="";is12Hour&&(a="AM",0==(n=parseInt(n,10))?(n=12,a="AM"):n>=12&&(a="PM",n>12&&(n-=12)),n=(" "+n).substr(-2)),g.setFont(font,timeFontSize),g.drawString(`${n}:${r}:${i}`,xyCenter,50,!0),g.setFont(font,smallFontSize),g.drawString(a,xyCenter+102,60,!0);var l=e.getMonth()+1,m=l.toString();l<10&&(m="0"+m);var s=e.getDate(),u=s.toString();s<10&&(u="0"+u),g.setFont(font,dateFontSize),g.drawString(`${e.getFullYear()}-${m}-${u}`,xyCenter,yposDate,!0);var w=Math.floor(e.getTime()/1e3);g.setFont(font,smallFontSize),g.drawString(`tst:${w}`,xyCenter,yposTst,!0);var T=new Date(e.getFullYear(),e.getMonth()+1,0).getDate();g.setFont(font,smallFontSize),g.drawString(`d:${locale.dow(e,!0)} md:${T} w:${getWeekNumber(e)}`,xyCenter,yposDml,!0),g.setFont(font,smallFontSize),g.drawString(`m:${getMoonPhase(e)} pod:${getPoD(e)}% poy:${getPoY(e)}%`,xyCenter,yposDayMonth,!0);var d=t[5];g.setFont(font,smallFontSize),g.drawString(d,xyCenter,yposGMT,!0)}Bangle.on("lcdPower",(function(e){e&&drawSimpleClock()})),g.clear(),Bangle.setUI("clock"),Bangle.loadWidgets(),Bangle.drawWidgets(),setInterval(drawSimpleClock,500),drawSimpleClock();
