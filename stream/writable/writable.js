/** Created by 31325_000 on 2018/1/2...*/

const {Writable} = require('stream')

class myWriteStream extends Writable {

    _writev(chunks, callback) {
        chunks.forEach((entry) => console.log(entry.chunk.toString()))
        callback()
    }

    /*_write(chunk, encoding, callback) {
        console.log(chunk.toString())
        console.log('--------------------')
        callback()
    }*/

}

const stream = new myWriteStream()

stream.cork()

stream.write('aaaaaa')

stream.write('bbbbbb')

setTimeout(() => stream.uncork(), 1000)

// process.stdin.pipe(stream)