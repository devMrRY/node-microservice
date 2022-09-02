module.exports.singleProcess = async(req, res) => {
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
}