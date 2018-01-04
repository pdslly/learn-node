/** Created by 31325_000 on 2018/1/4...*/
const net = require('net')

const client = net.connect(3000, function(){
    console.log('connected to server')
})

client.on('data', function(data){
    console.log(data.toString())
})

client.on('end', function(){
    console.log('disconnect from server')
})

process.stdin.on('data', function(data){
    client.write(data.toString())
})