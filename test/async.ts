/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { filterAsync } from '../src'

describe('async utils', () => {
  const items = Array.from(Array(20).keys())

  it('filterAsync should filter when the return value is falsy', async () => {
    const filtered = await filterAsync(items, async item => !!(item % 2))
    expect(filtered).to.have.lengthOf(10)
    for (const num of filtered) {
      expect(num % 2).to.equal(1)
    }
  })
})
