// https://cfpub.epa.gov/airnow/index.cfm?action=airnow.calculator

// const url = "https://www.purpleair.com/json?show=33609";
const purpleURL = "https://www.purpleair.com/data.json?opt=1/m/i/mPM25/a10/cC4&fetch=true&nwlat=37.41464813324302&selat=37.385251622748825&nwlng=-122.0721396076612&selng=-122.03034612134721&fields=pm_1,";


function aqiToHue(aqi) {
  if (aqi < 0) {
    return 200;
  }

  if (aqi > 120) {
    return 340;
  }

  if (aqi <= 120 && aqi >= 60) {
    return -1 * (aqi - 120);
  }

  if (aqi < 60) {
    return (-0.5 * (aqi - 60)) + 60;
  }

}

function calcAndPaint(nodes) {
  let list = [];
  let avg = 0;

  for (let i=0; i < nodes.length; i++) {
    const type = nodes[i][4];
    if (type == 0) {
      const raw = nodes[i][2];
      const lrapa = raw/2; // LRAPA is just divide by 2 of concentrations
      const aqi = AQIPM25(lrapa);
      list.push(aqi);
      avg += aqi;
      console.log(i + ": pm2.5 " + lrapa + " AQI: " + aqi);
    }
  }

  if (list.length > 0) {
    avg = avg / list.length;
  } else {
    avg = -1;
  }

  list.sort((a,b) => { return a-b;});

  const aqiDiv = document.getElementById("aqi");
  aqiDiv.innerHTML = Math.round(avg);

  const listDiv = document.getElementById("list");
  listDiv.innerHTML = list.join(', ');

  const bgColor = aqiToHue(avg);
  document.body.style.backgroundColor = "hsl(" + bgColor + ",90%,50%)";

}

function paintError(data) {
  const aqiDiv = document.getElementById("aqi");
  aqiDiv.innerHTML = data.message;
}

function fetchPurple(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      window.result = data;

      if (data.code && data.code == 429) {
        console.log("Error");
        console.log(data.message);
        paintError(data);
        return;
      }

      const nodes = data['data'];
      calcAndPaint(nodes);
    });
}




function Linear(AQIhigh, AQIlow, Conchigh, Conclow, Concentration) {
  var linear;
  var Conc = parseFloat(Concentration);
  var a;
  a = ((Conc - Conclow) / (Conchigh - Conclow)) * (AQIhigh - AQIlow) + AQIlow;
  linear = Math.round(a);
  return linear;
}
function AQIPM25(Concentration) {
  var Conc = parseFloat(Concentration);
  var c;
  var AQI;
  c = (Math.floor(10 * Conc)) / 10;
  if (c >= 0 && c < 12.1) {
    AQI = Linear(50, 0, 12, 0, c);
  } else if (c >= 12.1 && c < 35.5) {
    AQI = Linear(100, 51, 35.4, 12.1, c);
  } else if (c >= 35.5 && c < 55.5) {
    AQI = Linear(150, 101, 55.4, 35.5, c);
  } else if (c >= 55.5 && c < 150.5) {
    AQI = Linear(200, 151, 150.4, 55.5, c);
  } else if (c >= 150.5 && c < 250.5) {
    AQI = Linear(300, 201, 250.4, 150.5, c);
  } else if (c >= 250.5 && c < 350.5) {
    AQI = Linear(400, 301, 350.4, 250.5, c);
  } else if (c >= 350.5 && c < 500.5) {
    AQI = Linear(500, 401, 500.4, 350.5, c);
  } else {
    AQI = "PM25message";
  }
  return AQI;
}



fetchPurple(purpleURL);

// document.addEventListener("DOMContentLoaded", function(event) {
//   const aqiDiv = document.getElementById("aqi");
//   aqiDiv.innerHTML = 65;
//   const listDiv = document.getElementById("list");
//   listDiv.innerHTML = [65,54,46,234,25].join(', ');
//   document.body.style.backgroundColor = "hsl(" + aqiToHue(50) + ",90%,50%)";
// });
