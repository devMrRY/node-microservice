const EventEmitter = require('events');
const ev = new EventEmitter();
const {fork} = require('child_process');

module.exports.multiProcess = async(req, res) => {
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
}