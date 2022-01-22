# base65536-stream

Streaming implementation of the [Base65536](https://github.com/qntm/base65536) encoding.

## Installation

```bash
npm install base65536-stream
```

## Example usage

```js
import { EncodeStream, DecodeStream } from 'base65536-stream'

if (process.argv[2] === '--decode') {
  process.stdin
    .setEncoding('utf8') // convert incoming binary data to text
    .pipe(new DecodeStream())
    .pipe(process.stdout)
} else {
  process.stdin
    .pipe(new EncodeStream())
    .pipe(process.stdout)
}
```

## API

### EncodeStream

Subclass of [`Transform`](https://nodejs.org/api/stream.html#class-streamtransform) which encodes binary data as Base65536 text.

### DecodeStream

Subclass of [`Transform`](https://nodejs.org/api/stream.html#class-streamtransform) object which decodes Base65536 string data to binary.
