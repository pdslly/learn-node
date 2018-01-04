/** Created by 31325_000 on 2018/1/4...*/
const net = require('net')

const server = net.createServer(function(socket){
    console.log('client connect')

    socket.on('end', function(){
        this.write('good bye\r\n')
        this.pipe(this)
    })

    socket.on('data', function(data){
        console.log(data.toString())
        this.write(`from server: ${data.toString()}\r\n`)
        this.pipe(this)
    })

    socket.write('hello\r\n')
    socket.pipe(socket)
})

server.on('error', function(err){
    if (err) console.log(err)
})

server.listen(3000, function(){
    console.log('server start at port: %s', this.address().port)
})