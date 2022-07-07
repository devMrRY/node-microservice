const { workerData, parentPort } = require('worker_threads');

console.log(`started ${workerData}`);
let i=0;
while(i<10000000000){
    i++;
}

parentPort.postMessage({name: workerData, status: 'first_completed'});