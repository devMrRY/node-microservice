const EventEmitter = require('events');

const ev=new EventEmitter();
ev.on('test', (...args) => {
    console.log('test event called', args)
})

module.exports.testEvent = (req, res) => {
    ev.emit('test', 'raul', 23)
    res.send('done');
}