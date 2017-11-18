# base65536-stream

Streaming implementation of the [Base65536](https://github.com/qntm/base65536) encoding.

## Installation

```bash
$ npm install base65536-stream
```

## API

### base65536.createEncodeStream([wrap])

Returns a new [`stream`](https://nodejs.org/api/stream.html) object which encodes binary data as Base65536.

If `wrap` is set, a `\n` will be inserted between every `wrap` Unicode characters of output. Suggested value: 140.

### base65536.createDecodeStream([ignoreGarbage])

Returns a new [`stream`](https://nodejs.org/api/stream.html) object which decodes Base65536 to binary data.

If `ignoreGarbage` is set to `true`, non-Base65536 characters (line breaks, spaces, alphanumerics, ...) in the input will be ignored rather than causing an error.

## License

MIT
