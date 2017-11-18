/** Tests for base65536, ensure strings survive round trips, etc. */

'use strict'

const base65536Stream = require('./../dist/index.js') // test the built JS file
const fs = require('fs')

describe('base65536-stream', function () {
  describe('success cases', function () {
    const caseDir = './node_modules/base65536-test/data/pairs'
    let caseNames = [
      'demo',
      'firstDefect',
      'hatetris-wrs/hatetris-wr',
      'hatetris-wrs/hatetris-wr-rle',
      'hatetris-wrs/hatetris-wr-rle2',
      'sample-files/everyByte',
      'sample-files/everyPairOfBytes',
      'sample-files/lena_std.tif',
      'empty'
    ]
    for (let b = 0; b < 1 << 8; b++) {
      caseNames.push('single-bytes/case' + String(b))
    }
    for (let b = 0; b < 1 << 8; b++) {
      caseNames.push('doubled-bytes/case' + String(b) + '-' + String(b))
    }

    caseNames = caseNames.map(function (caseName) {
      return caseDir + '/' + caseName
    })

    describe('createEncodeStream', function () {
      caseNames.forEach(function (caseName) {
        const binaryFileName = caseName + '.bin'
        const textFileName = caseName + '.txt'

        it(binaryFileName + ' to ' + textFileName, function (done) {
          const text = fs.readFileSync(textFileName, 'utf8')
          const strs: string[] = []
          const encodeStream = fs.createReadStream(binaryFileName)
            .pipe(base65536Stream.createEncodeStream())
          encodeStream.on('data', function (chunk: string) {
            strs.push(chunk)
          })
          encodeStream.on('end', function () {
            expect(strs.join('')).toBe(text)
            done()
          })
        })
      })
    })

    describe('createDecodeStream', function () {
      caseNames.forEach(function (caseName) {
        const textFileName = caseName + '.txt'
        const binaryFileName = caseName + '.bin'

        it(textFileName + ' to ' + binaryFileName, function (done) {
          const binary = fs.readFileSync(binaryFileName)
          const buffers: Buffer[] = []
          const decodeStream = fs.createReadStream(textFileName)
            .setEncoding('utf8')
            .pipe(base65536Stream.createDecodeStream())
          decodeStream.on('data', function (chunk: Buffer) {
            buffers.push(chunk)
          })
          decodeStream.on('end', function () {
            expect(Buffer.concat(buffers).equals(binary)).toBe(true)
            done()
          })
        })
      })
    })

    describe('ignoreGarbage', function () {
      const caseDir = './node_modules/base65536-test/data/ignoreGarbage'
      let caseNames = [
        'abc',
        'continuationAtEnd',
        'lineBreak',
        'lineBreaks',
        'quoted',
        'randomAlphanumericInterference',
        'spaceAfter',
        'spaceBefore',
        'spacesEverywhere'
      ]
      caseNames = caseNames.map(function (caseName) {
        return caseDir + '/' + caseName
      })

      describe('by default', function () {
        caseNames.forEach(function (caseName) {
          const textFileName = caseName + '.txt'
          it('fails to decode ' + textFileName, function (done) {
            const decodeStream = fs.createReadStream(textFileName)
              .setEncoding('utf8')
              .pipe(base65536Stream.createDecodeStream())
            decodeStream.on('end', function () {
              fail()
            })
            decodeStream.on('error', function () {
              done()
            })
          })
        })
      })

      describe('`false`', function () {
        caseNames.forEach(function (caseName) {
          const textFileName = caseName + '.txt'
          it('fails to decode ' + textFileName, function (done) {
            const decodeStream = fs.createReadStream(textFileName)
              .setEncoding('utf8')
              .pipe(base65536Stream.createDecodeStream())
            decodeStream.on('end', function () {
              fail()
            })
            decodeStream.on('error', function () {
              done()
            })
          })
        })
      })

      describe('`true`', function () {
        caseNames.forEach(function (caseName) {
          const textFileName = caseName + '.txt'
          const binaryFileName = caseName + '.bin'
          it('successfully decodes ' + textFileName, function (done) {
            const binary = fs.readFileSync(binaryFileName)
            const buffers: Buffer[] = []
            const decodeStream = fs.createReadStream(textFileName)
              .setEncoding('utf8')
              .pipe(base65536Stream.createDecodeStream(true))
            decodeStream.on('data', function (chunk: Buffer) {
              buffers.push(chunk)
            })
            decodeStream.on('end', function () {
              expect(Buffer.concat(buffers).equals(binary)).toBe(true)
              done()
            })
            decodeStream.on('error', function () {
              fail()
            })
          })
        })
      })
    })

    describe('wrap', function () {
      const caseDir = './node_modules/base65536-test/data/wrap'
      let wrapCases = [
        {wrap: 1, cases: ['empty', 'hatetris-wr']},
        {wrap: 2, cases: ['empty', 'hatetris-wr-rle']},
        {wrap: 4, cases: ['empty', 'hatetris-wr-rle2']},
        {wrap: 5, cases: ['demo', 'empty']},
        {wrap: 76, cases: ['empty', 'everyByte']},
        {wrap: 140, cases: ['empty', 'lena_std.tif']},
        {wrap: 256, cases: ['empty', 'everyPairOfBytes']},
        {wrap: 1000, cases: ['empty', 'everyPairOfBytes']}
      ]
      wrapCases = wrapCases.map(function (wrapCase) {
        return {
          wrap: wrapCase.wrap,
          cases: wrapCase.cases.map(function (caseName) {
            return caseDir + '/' + String(wrapCase.wrap) + '/' + caseName
          })
        }
      })

      wrapCases.forEach(function (wrapCase) {
        describe(String(wrapCase.wrap), function () {
          wrapCase.cases.forEach(function (caseName) {
            const textFileName = caseName + '.txt'
            const binaryFileName = caseName + '.bin'
            it(textFileName + ' to ' + binaryFileName, function (done) {
              const binary = fs.readFileSync(binaryFileName)
              const text = fs.readFileSync(textFileName, 'utf8')

              const strs: string[] = []
              const encodeStream = fs.createReadStream(binaryFileName)
                .pipe(base65536Stream.createEncodeStream(wrapCase.wrap))
              encodeStream.on('data', function (chunk: string) {
                strs.push(chunk)
              })
              encodeStream.on('end', function () {
                expect(strs.join('')).toBe(text)

                const buffers: Buffer[] = []
                const decodeStream = fs.createReadStream(textFileName)
                  .setEncoding('utf8')
                  .pipe(base65536Stream.createDecodeStream(true))
                decodeStream.on('data', function (chunk: Buffer) {
                  buffers.push(chunk)
                })
                decodeStream.on('end', function () {
                  expect(Buffer.concat(buffers).equals(binary)).toBe(true)
                  done()
                })
              })
            })
          })
        })
      })
    })

    const forms = ['NFC', 'NFD', 'NFKC', 'NFKD']
    forms.forEach(function (form) {
      describe(form + ' normalization', function () {
        caseNames.forEach(function (caseName) {
          const textFileName = caseName + '.txt'
          it(textFileName + ' survives', function () {
            const text = fs.readFileSync(textFileName, 'utf8')
            expect(text.normalize(form)).toBe(text)
          })
        })
      })
    })
  })

  describe('failure cases', function () {
    const caseDir = './node_modules/base65536-test/data/bad'
    const caseNames = [
      'abc',
      'endOfStreamBeginsStream',
      'endOfStreamMidStream',
      'endOfStreamMidStreamEarlier',
      'eosThenJunk',
      'junkOnEnd',
      'lineBreak',
      'rogueEndOfStreamChar',
      'twoEndsOfStream'
    ].map(function (caseNames) {
      return caseDir + '/' + caseNames
    })

    describe('cannot decode', function () {
      caseNames.forEach(function (caseName) {
        const textFileName = caseName + '.txt'
        it(textFileName, function (done) {
          const decodeStream = fs.createReadStream(textFileName)
            .setEncoding('utf8')
            .pipe(base65536Stream.createDecodeStream())
          decodeStream.on('data', function (chunk: Buffer) {
            console.log(chunk)
          })
          decodeStream.on('end', function () {
            fail()
          })
          decodeStream.on('error', function () {
            done()
          })
        })
      })
    })
  })
})
