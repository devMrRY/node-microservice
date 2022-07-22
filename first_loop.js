process.on('message', (data) => {
    console.log(data)
    let i=0;
    while(i<10000000000){
        i++;
    }
    process.send('first_completed')
})
