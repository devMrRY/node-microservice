const { workerData, parentPort } = require('worker_threads');

console.log(`started worker thread1`);
const port = workerData;
let i=0;
while(i<10000000000){
    i++;
}
port.on("message", (data) => {
    console.log("port1", data);
})
port.postMessage(`hi from thread2`);

parentPort.on("message", (data) => {
    console.log(data)
})
parentPort.postMessage({ status: 'first_completed'});