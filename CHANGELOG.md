# Change log

## 655.3.6

Support for Node.js 22 and lower is dropped.

## 65.5.36

* Support for Node.js <14 is dropped.
* Support for CommonJS is dropped. `base65536-stream` is now provided as ES modules only.
* Methods `createEncodeStream` and `createDecodeStream` have been replaced with classes `EncodeStream` and `DecodeStream`.
* `EncodeStream` no longer supports the "wrap" option.
* `DecodeStream` no longer supports the "ignore garbage" option.
* No one uses this so it doesn't matter.

## 6.55.36

Initial release.
