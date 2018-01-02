# Stream -> Wriable 源码解读
* 声明Writable对象
```javascript
const {Writable} = require('stream')
class myWritableStream extends Writable {
    /********
    /* chunk 读取的Buffer块
    /* encoding 字符编码格式 如‘buffer’
    /* onwritecb 内部函数 见_stream_wriable.js L422
    /********
    _write(chunk, encoding, onwritecb) {}

    /********
    /* chunks 包含Buffer的数组
    /* onwritecb 内部函数 见_stream_wriable.js L422
    /********
    _writev(chunks, onwritecb) {}
}
```
* onwrite
```javascript
function onwrite(stream, er) {

  ......

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    // 如果state.corked不为0 调用clearBuffer
    if (!finished &&
        !state.corked &&
        !state.bufferProcessing &&
        state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}
```
* clearBuffer
```javascript
function clearBuffer(stream, state) {

  ......

  // 如果有声明_writev 此处Buffer 转化为数组
  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf)
        allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    ......

  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);

      ......

    }

  }

  ......

}
```
* Writable.prototype.write
```javascript
Writable.prototype.write = function(chunk, encoding, cb) {

  ......

  if (state.ended)
    // 如果已经调用end事件 此处抛出错误write after end
    writeAfterEnd(this, cb);
  else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  ......
};

```
* Writable.prototype.cork 通过自增state.corked 强制写入的数据缓冲在内存
* Writable.prototype.uncork 调用cork()之后 通过uncork来刷新内存
```javascript
stream.cork();
stream.write('some ');
stream.cork();
stream.write('data ');
process.nextTick(() => {
  stream.uncork();
  // nothing
  // 数据将在第二次调用uncork之后刷新
  stream.uncork();
  // some
  // data
});
```
* writeOrBuffer
```javascript

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {

  ......

  // 如果正在写入或者已经调用cord() state.bufferedRequest循环存储 否则调用doWrite
  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk,
      encoding,
      isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  ......

}
```
* doWrite
```javascript
function doWrite(stream, state, writev, len, chunk, encoding, cb) {

  ......

  // 如果在new Wriable(option)对象时 指定了option.writev钩子函数 此处调用option.writev 否则调用option.write
  if (writev)
    stream._writev(chunk, state.onwrite);
  else
    stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}
```

