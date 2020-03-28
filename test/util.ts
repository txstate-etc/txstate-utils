import { sleep, randomid } from '../src'
import { expect } from 'chai'

describe('sleep', () => {
  it('should sleep for the correct amount of time', async () => {
    const startTime = new Date()
    await sleep(30)
    const endTime = new Date()
    const elapsed = endTime.getTime() - startTime.getTime()
    expect(elapsed).to.be.lessThan(45)
    expect(elapsed).to.be.greaterThan(15)
  })
})

describe('randomid', () => {
  it('should always begin with a lowercase letter and be greater than 4 characters', () => {
    const id = randomid()
    expect(id).to.match(/^[a-z]/)
    expect(id.length).to.be.gte(4)
  })
})
