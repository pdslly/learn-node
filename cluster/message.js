/** Created by 31325_000 on 2018/1/4...*/
// events -> message

const cluster = require('cluster')

if (cluster.isMaster) {
    let numCPUS = require('os').cpus().length
    for(let i = 0; i < numCPUS; i++){
        cluster.fork()
    }

    function messageHandle({msg}) {
        if (msg === 'shutdown'){
            this.disconnect()
        }
    }

    function disconnectHandle() {
        console.log('disconnect')
    }

    for(const id in cluster.workers){
        cluster.workers[id].on('message', messageHandle)
        cluster.workers[id].on('disconnect', disconnectHandle)
    }
} else {
    process.send({msg: 'shutdown'})
}