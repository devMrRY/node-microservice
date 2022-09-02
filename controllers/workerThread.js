const { Worker, workerData, isMainThread, parentPort } = require('worker_threads');

module.exports.workerThread = (req, res) => {
    console.time('w1')
    let done = {
        'first': false,
        'sec': false,
    }
    if (isMainThread) {
        const worker1 = new Worker('../services/multiThreading/first_worker.js', { workerData: 'Worker Data 1'});
        worker1.on('message', message => {
            done['first'] = true;
            console.log(message);
            ev.emit('done');
        });
        const worker2 = new Worker('../services/multiThreading/sec_worker.js', { workerData: 'Worker Data 2' });
        worker2.on('message', message => {
            done['sec'] = true;
            console.log(message);
            ev.emit('done');
        });
    }
    ev.on('done', () => {
        if(done['first'] && done['sec']){
            console.timeEnd('w1')
            res.send(`process ${process.pid}, data: ${workerData}`);
        }
    })
}