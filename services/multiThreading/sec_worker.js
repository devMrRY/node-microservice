const { workerData, parentPort } = require('worker_threads');

console.log(`started worker thread2`);
const port = workerData;
let i=0;
while(i<10000000000){
    i++;
}
port.on("message", (data) => {
    console.log("port2", data);
})
port.postMessage(`hi from thread2`);

parentPort.on("message", (data) => {
    console.log(`message received to second worker: ${JSON.stringify(data)}`);
})

parentPort.postMessage({ status: 'sec_completed'});