var locale=require("locale");const big=g.getWidth()>200,timeFontSize=big?4:3,dateFontSize=big?3:2,smallFontSize=big?2:1,font="6x8",xyCenter=g.getWidth()/2,yposTime=50,yposDate=big?85:75,yposTst=big?115:95,yposDml=big?170:130,yposDayMonth=big?195:140,yposGMT=big?220:150;var is12Hour=(require("Storage").readJSON("setting.json",1)||{})["12hour"];function getUTCTime(t){return t.toUTCString().split(" ")[4].split(":").map((function(t){return Number(t)}))}function drawSimpleClock(){var t=new Date,e=t.toString().split(" "),n=getUTCTime(t);g.reset(),g.setFontAlign(0,0);var o=e[4].split(":"),r=o[0],i=o[1],a=o[2],l="";is12Hour&&(l="AM",0==(r=parseInt(r,10))?(r=12,l="AM"):r>=12&&(l="PM",r>12&&(r-=12)),r=(" "+r).substr(-2)),g.setFont(font,timeFontSize),g.drawString(`${r}:${i}:${a}`,xyCenter,50,!0),g.setFont(font,smallFontSize),g.drawString(l,xyCenter+102,60,!0);var s=t.getMonth()+1,S=s.toString();s<10&&(S="0"+S);var d=t.getDate(),m=d.toString();d<10&&(m="0"+m),g.setFont(font,dateFontSize),g.drawString(`${t.getFullYear()}-${S}-${m}`,xyCenter,yposDate,!0);var p=Math.floor(t.getTime()/1e3);g.setFont(font,smallFontSize),g.drawString(`tst:${p}`,xyCenter,yposTst,!0);var y=new Date(t.getFullYear(),t.getMonth()+1,0).getDate(),F=new Date(2020,2,24,9,28,0),c=(t.getTime()-F.getTime())/1e3/60/60/24/29.53%1*29.53;g.setFont(font,smallFontSize),g.drawString(`md:${y} l:${c.toFixed(2)}`,xyCenter,yposDml,!0);var w=Math.floor(1e3*((n[0]+1)%24+n[1]/60+n[2]/3600)/24);g.setFont(font,smallFontSize),g.drawString(`m:${locale.month(t,!0)} d:${locale.dow(t,!0)} @${w}`,xyCenter,yposDayMonth,!0);var u=e[5];g.setFont(font,smallFontSize),g.drawString(u,xyCenter,yposGMT,!0)}Bangle.on("lcdPower",(function(t){t&&drawSimpleClock()})),g.clear(),Bangle.setUI("clock"),Bangle.loadWidgets(),Bangle.drawWidgets(),setInterval(drawSimpleClock,500),drawSimpleClock();