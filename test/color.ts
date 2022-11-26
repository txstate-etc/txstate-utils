/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { shouldUseWhiteText } from '../lib'

describe('color utils', () => {
  it('should prefer white text for a black background', async () => {
    expect(shouldUseWhiteText('rgb(0, 0, 0)')).to.be.true
    expect(shouldUseWhiteText('rgba(0, 0, 0, 1)')).to.be.true
    expect(shouldUseWhiteText('#000000')).to.be.true
    expect(shouldUseWhiteText('000000')).to.be.true
    expect(shouldUseWhiteText([0, 0, 0])).to.be.true
    expect(shouldUseWhiteText({ red: 0, green: 0, blue: 0 })).to.be.true
  })
  it('should prefer black text for a white background', async () => {
    expect(shouldUseWhiteText('#FFFFFF')).to.be.false
    expect(shouldUseWhiteText('FFFFFF')).to.be.false
    expect(shouldUseWhiteText([255, 255, 255])).to.be.false
    expect(shouldUseWhiteText({ red: 255, green: 255, blue: 255 })).to.be.false
  })
  it('should prefer white text for a blue background', async () => {
    expect(shouldUseWhiteText('rgb(0, 0, 255 )')).to.be.true
    expect(shouldUseWhiteText('rgba( 0,0, 255, 1)')).to.be.true
    expect(shouldUseWhiteText('#0000FF')).to.be.true
    expect(shouldUseWhiteText('0000FF')).to.be.true
    expect(shouldUseWhiteText([0, 0, 255])).to.be.true
    expect(shouldUseWhiteText({ red: 0, green: 0, blue: 255 })).to.be.true
  })
})
