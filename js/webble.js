/*
    Web BLE Scanning
*/    

let filters = [];
filters.push({namePrefix: "Fireseatrack"});

const scan_options = {
    keepRepeatedDevices: true,
    filters: filters
};

async function scanForAdvertisements() {
  try {
    clearLog();
    const scan = await navigator.bluetooth.requestLEScan(scan_options);
    navigator.bluetooth.addEventListener('advertisementreceived', event => {
        handleBLEScanEvent(event);
        return;
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

