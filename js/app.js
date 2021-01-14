window.onload = () => {
  'use strict';
  console.log("[js/app.js] app.js onload");
}

let scanButton = document.querySelector('#scanButton');
// Handle scan button click
scanButton.addEventListener('click', scanForAdvertisements);


let filters = [];
filters.push({namePrefix: "Fireseatrack"});


const scan_options = {
    keepRepeatedDevices: true,
    filters: filters
};


async function scanForAdvertisements() {
  try {
    //clearLog();
    const scan = await navigator.bluetooth.requestLEScan(scan_options);

    log('Requesting Bluetooth Scan with options: ' + JSON.stringify(scan_options));
    log('Scan started with:');
    log(' acceptAllAdvertisements: ' + scan.acceptAllAdvertisements);
    log(' active: ' + scan.active);
    log(' keepRepeatedDevices: ' + scan.keepRepeatedDevices);
    log(' filters: ' + JSON.stringify(scan.filters));

    navigator.bluetooth.addEventListener('advertisementreceived', event => {
      
      log('Advertisement received.');
      log('  Device Name: ' + event.device.name);
      log('  Device ID: ' + event.device.id);
      log('  RSSI: ' + event.rssi);
      log('  TX Power: ' + event.txPower);
      log('  UUIDs: ' + event.uuids);
    
      
      let record = {};
      event.manufacturerData.forEach((valueDataView, key) => {
        //record = wdlogDataView('Manufacturer', key, valueDataView);
        logDataView('Manufacturer', key, valueDataView);
      });
      
/*      
      event.serviceData.forEach((valueDataView, key) => {
        logDataView('Service', key, valueDataView);
      });
*/      
    });

    setTimeout(stopScan, 10000);
    function stopScan() {
      log('Stopping scan...');
      scan.stop();
      log('Stopped.  scan.active = ' + scan.active);
    }
  } catch(error)  {
    log('Argh! ' + error);
  }
}

/* Utils */
const logDataView = (labelOfDataSource, key, valueDataView) => {
  const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
    return b.toString(16).padStart(2, '0');
  }).join(' ');
  const textDecoder = new TextDecoder('ascii');
  const asciiString = textDecoder.decode(valueDataView.buffer);
  log(`  ${labelOfDataSource} Data: ` + key +
      '\n    (Hex) ' + hexString +
      '\n    (ASCII) ' + asciiString);
};

/*
const wdlogDataView = (labelOfDataSource, key, valueDataView) => {
  const raw = [...new Uint8Array(valueDataView.buffer)].map(b => {
    return b.toString(16).padStart(2, '0');
  }).join('');

  var t= '0x' + raw.slice(2,6);
  var h = parseInt('0x' + raw.slice(10,14));
  var b = parseInt('0x' + raw.slice(20,22) );
  
  t = parseInt (t) ;
  t = Math.round(100*(t/32 - 50))/100;
  h = Math.round(100*(((h&4095)-575)/14.73))/100

  t = t.toFixed(2);
  h = h.toFixed(2);

  log('Temp '   + t + ' Hum '  + h + ' Bat ' + b );
  return( { temperature:t, humidity:h, batterylevel:b} );
}
*/

function log() {
  var line = Array.prototype.slice.call(arguments).map(function(argument) {
    return typeof argument === 'string' ? argument : JSON.stringify(argument);
  }).join(' ');
  document.querySelector('#log').textContent += line + '\n';
}

function clearLog() {
  document.querySelector('#log').textContent = '';
}

function setStatus(status) {
  document.querySelector('#status').textContent = status;
}

function setContent(newContent) {
  var content = document.querySelector('#content');
  while(content.hasChildNodes()) {
    content.removeChild(content.lastChild);
  }
  content.appendChild(newContent);
}
 
