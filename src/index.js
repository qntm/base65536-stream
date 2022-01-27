import { Transform } from 'stream'

const paddingBlockStart = 'ᔀ'.codePointAt(0)
const blockStarts = [...
  '㐀㔀㘀㜀㠀㤀㨀㬀㰀㴀㸀㼀䀀䄀䈀䌀' +
  '䐀䔀䘀䜀䠀䤀䨀䬀䰀一伀倀儀刀匀吀' +
  '唀嘀圀堀夀娀嬀尀崀帀开怀愀戀挀搀' +
  '攀昀最栀椀樀欀氀洀渀漀瀀焀爀猀琀' +
  '甀瘀眀砀礀稀笀簀紀縀缀耀脀舀茀萀' +
  '蔀蘀蜀蠀褀言謀谀贀踀輀退鄀鈀錀鐀' +
  '销阀需頀餀騀鬀鰀鴀鸀ꄀꈀꌀꔀ𐘀𒀀' +
  '𒄀𒈀𓀀𓄀𓈀𓌀𔐀𔔀𖠀𖤀𠀀𠄀𠈀𠌀𠐀𠔀' +
  '𠘀𠜀𠠀𠤀𠨀𠬀𠰀𠴀𠸀𠼀𡀀𡄀𡈀𡌀𡐀𡔀' +
  '𡘀𡜀𡠀𡤀𡨀𡬀𡰀𡴀𡸀𡼀𢀀𢄀𢈀𢌀𢐀𢔀' +
  '𢘀𢜀𢠀𢤀𢨀𢬀𢰀𢴀𢸀𢼀𣀀𣄀𣈀𣌀𣐀𣔀' +
  '𣘀𣜀𣠀𣤀𣨀𣬀𣰀𣴀𣸀𣼀𤀀𤄀𤈀𤌀𤐀𤔀' +
  '𤘀𤜀𤠀𤤀𤨀𤬀𤰀𤴀𤸀𤼀𥀀𥄀𥈀𥌀𥐀𥔀' +
  '𥘀𥜀𥠀𥤀𥨀𥬀𥰀𥴀𥸀𥼀𦀀𦄀𦈀𦌀𦐀𦔀' +
  '𦘀𦜀𦠀𦤀𦨀𦬀𦰀𦴀𦸀𦼀𧀀𧄀𧈀𧌀𧐀𧔀' +
  '𧘀𧜀𧠀𧤀𧨀𧬀𧰀𧴀𧸀𧼀𨀀𨄀𨈀𨌀𨐀𨔀'
].map(chr => chr.codePointAt(0))

const BITS = 8

const b2s = {}
for (let b = 0; b < (1 << BITS); b++) {
  b2s[blockStarts[b]] = b
}

export class EncodeStream extends Transform {
  constructor (options) {
    super(options)
    this.oddByte = undefined
  }

  _transform (chunk, _encoding, callback) {
    let str = ''
    for (const b of chunk) {
      if (this.oddByte === undefined) {
        this.oddByte = b
      } else {
        str += String.fromCodePoint(blockStarts[b] + this.oddByte)
        this.oddByte = undefined
      }
    }
    callback(null, str)
  }

  _flush (callback) {
    let str = ''
    if (this.oddByte !== undefined) {
      str += String.fromCodePoint(paddingBlockStart + this.oddByte)
      this.oddByte = undefined
    }
    callback(null, str)
  }
}

export class DecodeStream extends Transform {
  constructor (options) {
    super({ ...options, decodeStrings: false })
    this.done = false
  }

  _transform (chunk, _encoding, callback) {
    const bytes = []
    for (const chr of chunk) {
      if (this.done) {
        callback(Error('Base65536 sequence continued after final byte'))
        return
      }

      const codePoint = chr.codePointAt(0)
      const oddByte = codePoint & ((1 << BITS) - 1)
      const blockStart = codePoint - oddByte
      if (blockStart === paddingBlockStart) {
        bytes.push(oddByte)
        this.done = true
      } else if (blockStart in b2s) {
        bytes.push(oddByte, b2s[blockStart])
      } else {
        callback(Error(`Not a valid Base65536 character: ${chr}`))
        return
      }
    }
    callback(null, Buffer.from(bytes))
  }
}
