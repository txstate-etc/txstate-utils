/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { createHash } from 'node:crypto'
import { base64urlDecode, base64urlEncode, randomid, sha256andbase64url } from '../lib'

describe('base64url', () => {
  const utf8str = '✓ à la mode'
  it('encodes utf8 to the same base64url as Node Buffer and decodes again', () => {
    const bufferEncoded = Buffer.from(utf8str, 'utf8').toString('base64url')
    expect(base64urlEncode(utf8str)).to.equal(bufferEncoded)
    expect(base64urlDecode(bufferEncoded)).to.equal(utf8str)
  })
  it('creates an sha256 digest in base64url the same way as Node crypto', async () => {
    const hashed = createHash('sha256').update(utf8str).digest('base64url')
    expect(await sha256andbase64url(utf8str)).to.equal(hashed)
    const asciistr = randomid(20)
    const asciihashed = createHash('sha256').update(asciistr).digest('base64url')
    expect(await sha256andbase64url(asciistr)).to.equal(asciihashed)
  })
})
