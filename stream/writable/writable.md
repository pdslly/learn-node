##Stream -> Wriable 源码解读

*Writable.prototype.write
```javascrpt
Writable.prototype.write = function(chunk, encoding, cb) {

  ......

  if (state.ended)
    writeAfterEnd(this, cb);
  else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  ......
};

```