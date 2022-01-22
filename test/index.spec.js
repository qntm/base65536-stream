import assert from 'assert'
import fs from 'fs'

import { EncodeStream, DecodeStream } from '../src/index.js'

describe('base65536-stream', () => {
  describe('success cases', () => {
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

    caseNames = caseNames.map(caseName => caseDir + '/' + caseName)

    describe('EncodeStream', () => {
      caseNames.forEach(caseName => {
        const binaryFileName = caseName + '.bin'
        const textFileName = caseName + '.txt'

        it(binaryFileName + ' to ' + textFileName, done => {
          const text = fs.readFileSync(textFileName, 'utf8')
          const strs = []
          const encodeStream = fs.createReadStream(binaryFileName)
            .pipe(new EncodeStream())
          encodeStream.on('data', chunk => {
            strs.push(chunk)
          })
          encodeStream.on('end', () => {
            assert.strictEqual(strs.join(''), text)
            done()
          })
        })
      })
    })

    describe('DecodeStream', () => {
      caseNames.forEach(caseName => {
        const textFileName = caseName + '.txt'
        const binaryFileName = caseName + '.bin'

        it(textFileName + ' to ' + binaryFileName, done => {
          const binary = fs.readFileSync(binaryFileName)
          const buffers = []
          const decodeStream = fs.createReadStream(textFileName)
            .setEncoding('utf8')
            .pipe(new DecodeStream())
          decodeStream.on('data', chunk => {
            buffers.push(chunk)
          })
          decodeStream.on('end', () => {
            assert.deepStrictEqual(Buffer.concat(buffers), binary)
            done()
          })
        })
      })
    })

    const forms = ['NFC', 'NFD', 'NFKC', 'NFKD']
    forms.forEach(form => {
      describe(form + ' normalization', () => {
        caseNames.forEach(caseName => {
          const textFileName = caseName + '.txt'
          it(textFileName + ' survives', () => {
            const text = fs.readFileSync(textFileName, 'utf8')
            assert.strictEqual(text.normalize(form), text)
          })
        })
      })
    })
  })

  describe('failure cases', () => {
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
    ].map(caseName => caseDir + '/' + caseName)

    describe('cannot decode', () => {
      caseNames.forEach(caseName => {
        const textFileName = caseName + '.txt'
        it(textFileName, done => {
          const decodeStream = fs.createReadStream(textFileName)
            .setEncoding('utf8')
            .pipe(new DecodeStream())
          decodeStream.on('end', () => {
            done(Error('should have errored'))
          })
          decodeStream.on('error', () => {
            done()
          })
        })
      })
    })
  })
})
