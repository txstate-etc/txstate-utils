/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { eachConcurrent, sleep } from '../src'

describe('async utils', () => {
  const items = Array.from(Array(20).keys())
  it('eachConcurrent should go through a list of items with a max concurrency of 5', async () => {
    const starttime = new Date()
    await eachConcurrent(items, 5, () => sleep(50))
    const endtime = new Date()
    expect(endtime.getTime() - starttime.getTime()).to.be.lessThan(250).and.gte(200)
  })

  it('eachConcurrent should default to a max concurrency of 10', async () => {
    const starttime = new Date()
    await eachConcurrent(items, () => sleep(50))
    const endtime = new Date()
    expect(endtime.getTime() - starttime.getTime()).to.be.lessThan(150).and.gte(100)
  })
})
