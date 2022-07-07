const express = require('express');
const app = express();
const cluster = require('cluster');
const {fork} = require('child_process');
const EventEmitter = require('events');
const os = require('os');
const { Worker, workerData, isMainThread, parentPort } = require('worker_threads');
const PORT = 5000;
const cors = require('cors');

const ev = new EventEmitter();

app.use(cors());

app.get('/server/health', (req, res) => {
    res.send(`server is running ${process.pid}`);
})

process.on('unhandledRejection', (err, data) => {
    console.log('rahul unhandled rejection occured')
    console.error(err ? err.message : err)
})

app.get('/test/multi_process', async(req, res) => {
    console.time('t1')
    const first = fork('./first_loop.js');
    const sec = fork('./sec_loop.js');
    let done = {
        'first': false,
        'sec': false,
    }
    first.send('first_start');
    sec.send('sec_start')
    first.on('message', (result) => {
        done['first'] = true;
        console.log(result);
        ev.emit('done');
    })
    sec.on('message', (result) => {
        done['sec'] = true;
        console.log(result);
        ev.emit('done');
    })
    ev.on('done', () => {
        if(done['first'] && done['sec']){
            console.timeEnd('t1')
            res.send(`process ${process.pid}`);
        }
    })
})

app.get('/test/worker_thread', (req, res) => {
    console.time('w1')
    let done = {
        'first': false,
        'sec': false,
    }
    if (isMainThread) {
        const worker1 = new Worker('./first_worker.js', { workerData: 'Worker Data 1'});
        worker1.on('message', message => {
            done['first'] = true;
            console.log(message);
            ev.emit('done');
        });
        const worker2 = new Worker('./sec_worker.js', { workerData: 'Worker Data 2' });
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
})

app.get('/test/single_process', async(req, res) => {
    console.time('t1')
    let i=0;
    let j=0;
    while(i<10000000000){
        i++;
    }
    while(j<10000000000){
        j++;
    }
    console.timeEnd('t1')
    res.send(`process ${process.pid}`);
})

if(cluster.isMaster){
    let nCPUs = os.cpus().length;
    for(let i=0; i<nCPUs; i++){
        let worker = cluster.fork();
    }
}else{
    const server = app.listen(PORT, () => {
        console.log(`server is listening with process ${process.pid} on port ${PORT}`)
    })

    process.on('SIGTERM', () => {
        server.close(() => {
            console.log('server is closed');
            process.exit(0);
        })
    })
}
