window.onload = () => {
  'use strict';
  console.log("[js/app.js] app.js onload");
}

let scanButton_table = document.querySelector('#scanButton_table');
let scanButton_live = document.querySelector('#scanButton_live');
// Handle scan button click

function locationType(){
  if( window.location.protocol == 'file:' ){ return 0; }
  if( !window.location.host.replace( /localhost|127\.0\.0\.1/i, '' ) ){ return 2; }
  return 1;
}

if ( locationType() != 0 ) {
  console.log("running local: fake the ble events");
  scanButton_table.addEventListener('click', scanForAdvertisementsFake);
  scanButton_live.addEventListener('click', scanForAdvertisementsFake);
} else {
  console.log("running server: using real the ble events");
  scanButton_live.addEventListener('click', scanForAdvertisements);
  scanButton_table.addEventListener('click', scanForAdvertisements);
}  

let sDev = new Map();

const handleBLEScanEvent = (evt) => {
  let id = atob(evt.device.id);

  log('id:' + atob(evt.device.id) + ' Name:' + evt.device.name + " rssi:" + evt.rssi);
  let record = {};

  evt.manufacturerData.forEach((valueDataView, key) => {
    // key see https://github.com/dougt/webbluetooth-examples/blob/master/bluetooth_manufacturers.js
    //log('key:' + key + ' data:' + valueDataView);
    record = wdlogDataView('Manufacturer', key, valueDataView);
  });

  evt.record = record
  // insert and update the entry
  sDev.set(id,evt);

  //console.log(sDev.size);
  //console.log(sDev);
  updateTableHTML(sDev)
}

const wdlogDataView = (labelOfDataSource, key, valueDataView) => {
  const raw = [...new Uint8Array(valueDataView.buffer)].map(b => {
    return b.toString(16).padStart(2, '0');
  }).join('');

  //log('buf:' + valueDataView.buffer);
  //log('raw:' + raw);
  var t= parseInt('0x' + raw.slice(2,6));
  var h = parseInt('0x' + raw.slice(10,14));
  var b = parseInt('0x' + raw.slice(20,22) );
  
  t = Math.round(100*(t/32 - 50))/100;
  h = Math.round(100*(((h&4095)-575)/14.73))/100

  t = t.toFixed(2);
  h = h.toFixed(2);

  log('Temp '   + t + ' Hum '  + h + ' Bat ' + b );
  return( { temperature:t, humidity:h, batterylevel:b} );
}


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


function updateTableHTML(myArray) {
  var tableBody = document.getElementById("table-body-id");

  // Reset the table
  tableBody.innerHTML = "";

  // Build the new table
  myArray.forEach(function(row) {
      var newRow = document.createElement("tr");
      tableBody.appendChild(newRow);

      //console.log("updateTableHTML row: "  + JSON.stringify(row));

      var newCell_id = document.createElement("td");
      newCell_id.textContent = atob(row.device.id);
      newRow.appendChild(newCell_id);

      var newCell_name = document.createElement("td");
      newCell_name.textContent = row.device.name;
      newRow.appendChild(newCell_name);

      var newCell_temp = document.createElement("td");
      newCell_temp.textContent = row.record.temperature;
      newRow.appendChild(newCell_temp);
      
      var newCell_humi = document.createElement("td");
      newCell_humi.textContent = row.record.humidity;
      newRow.appendChild(newCell_humi);
      
      var newCell_bat = document.createElement("td");
      newCell_bat.textContent = row.record.batterylevel;
      newRow.appendChild(newCell_bat);      
/*      
      if (row instanceof Array) {
          row.forEach(function(cell) {
              var newCell = document.createElement("td");
              newCell.textContent = cell;
              newRow.appendChild(newCell);
          });
      } else {
          newCell = document.createElement("td");
          newCell.textContent = row;
          newRow.appendChild(newCell);
      }
*/      
  });
}
 
