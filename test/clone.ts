/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { clone, equal } from '../lib'
import { treeify } from './equal'

function rnd (max: number) { return Math.round(Math.random() * max) }
describe('clone', () => {
  it('does not copy proto properties', () => {
    expect(clone(Object.create({ a: 1 })).a).to.be.undefined
  })
  it('number', () => {
    expect(clone(42)).to.equal(42)
  })
  it('string', () => {
    expect(clone('str')).to.equal('str')
  })
  it('boolean', () => {
    expect(clone(true)).to.equal(true)
  })
  it('function', () => {
    const fn = () => {}
    expect(clone(fn)).to.equal(fn)
  })
  it('async function', () => {
    const fn = async () => {}
    expect(clone(fn)).to.equal(fn)
  })
  it('generator function', () => {
    const fn = function * () {}
    expect(clone(fn)).to.equal(fn)
  })
  it('dates get new instances', () => {
    const date = new Date()
    expect(+clone(date)).to.equal(+date) // milliseconds match
    expect(clone(date)).to.not.equal(date)
  })
  it('null', () => {
    expect(clone(null)).to.be.null
  })
  it('shallow object', () => {
    const o = { a: 1, b: 2 }
    expect(clone(o)).to.deep.equal(o)
    expect(clone(o)).to.not.equal(o)
  })
  it('shallow array', () => {
    const o = [1, 2]
    expect(clone(o)).to.deep.equal(o)
    expect(clone(o)).to.not.equal(o)
  })
  it('deep object', () => {
    const o = { nest: { a: 1, b: 2 } }
    expect(clone(o)).to.deep.equal(o)
    expect(clone(o)).to.not.equal(o)
    expect(clone(o).nest).to.not.equal(o.nest)
  })
  it('deep array', () => {
    const o = [{ a: 1, b: 2 }, [3]]
    expect(clone(o)).to.deep.equal(o)
    expect(clone(o)).to.not.equal(o)
    expect(clone(o)[0]).to.not.equal(o[0])
    expect(clone(o)[1]).to.not.equal(o[1])
  })
  it('nested number', () => {
    expect(clone({ a: 1 }).a).to.equal(1)
  })
  it('nested string', () => {
    expect(clone({ s: 'str' }).s).to.equal('str')
  })
  it('nested boolean', () => {
    expect(clone({ b: true }).b).to.be.true
  })
  it('nested function', () => {
    const fn = () => {}
    expect(clone({ fn }).fn).to.equal(fn)
  })
  it('nested async function', () => {
    const fn = async () => {}
    expect(clone({ fn }).fn).to.equal(fn)
  })
  it('nested generator function', () => {
    const fn = function * () {}
    expect(clone({ fn }).fn).to.equal(fn)
  })
  it('nested date', () => {
    const date = new Date()
    expect(+clone({ d: date }).d).to.equal(+date)
    expect(clone({ d: date }).d).to.not.equal(date)
  })
  it('nested date in array', () => {
    const date = new Date()
    expect(+clone({ d: [date] }).d[0]).to.equal(+date)
    expect(clone({ d: [date] }).d[0]).to.not.equal(date)
  })
  it('nested null', () => {
    expect(clone({ n: null }).n).to.be.null
  })
  it('arguments', () => {
    function fn (...args: any) {
      expect(clone(args)).to.deep.equal(args)
      expect(clone(arguments)).to.deep.equal(Array.from(arguments))
      expect(clone(arguments)).to.not.equal(arguments)
    }
    fn(1, 2, 3)
  })
  it('copy buffers from object correctly', () => {
    const input = Date.now().toString(36)
    const inputBuffer = Buffer.from(input)
    const clonedBuffer = clone({ a: inputBuffer }).a
    expect(Buffer.isBuffer(clonedBuffer)).to.be.true
    expect(clonedBuffer).to.not.equal(inputBuffer)
    expect(clonedBuffer.toString()).to.equal(input)
  })
  it('copy buffers from arrays correctly', () => {
    const input = Date.now().toString(36)
    const inputBuffer = Buffer.from(input)
    const [clonedBuffer] = clone([inputBuffer])
    expect(Buffer.isBuffer(clonedBuffer)).to.be.true
    expect(clonedBuffer).to.not.equal(inputBuffer)
    expect(clonedBuffer.toString()).to.equal(input)
  })
  it('copy TypedArrays from object correctly', () => {
    const [input1, input2] = [rnd(10), rnd(10)]
    const buffer = new ArrayBuffer(8)
    const int32View = new Int32Array(buffer)
    int32View[0] = input1
    int32View[1] = input2
    const cloned = clone({ a: int32View }).a
    expect(cloned instanceof Int32Array).to.be.true
    expect(cloned).to.not.equal(int32View)
    expect(cloned[0]).to.equal(input1)
    expect(cloned[1]).to.equal(input2)
  })
  it('copy TypedArrays from array correctly', () => {
    const [input1, input2] = [rnd(10), rnd(10)]
    const buffer = new ArrayBuffer(16)
    const int32View = new Int32Array(buffer)
    int32View[0] = input1
    int32View[1] = input2
    const [cloned] = clone([int32View])
    expect(cloned instanceof Int32Array).to.be.true
    expect(cloned).to.not.equal(int32View)
    expect(cloned[0]).to.equal(input1)
    expect(cloned[1]).to.equal(input2)
  })
  it('copy complex TypedArrays', () => {
    const [input1, input2, input3] = [rnd(10), rnd(10), rnd(10)]
    const buffer = new ArrayBuffer(4)
    const view1 = new Int8Array(buffer, 0, 2)
    const view2 = new Int8Array(buffer, 2, 2)
    const view3 = new Int8Array(buffer)
    view1[0] = input1
    view2[0] = input2
    view3[3] = input3
    const cloned = clone({ view1, view2, view3 })
    expect(cloned.view1 instanceof Int8Array).to.be.true
    expect(cloned.view2 instanceof Int8Array).to.be.true
    expect(cloned.view3 instanceof Int8Array).to.be.true
    expect(cloned.view1).to.not.equal(view1)
    expect(cloned.view2).to.not.equal(view2)
    expect(cloned.view3).to.not.equal(view3)
    expect(Array.from(cloned.view1)).to.deep.equal([input1, 0])
    expect(Array.from(cloned.view2)).to.deep.equal([input2, input3])
    expect(Array.from(cloned.view3)).to.deep.equal([input1, 0, input2, input3])
  })
  it('maps', () => {
    const map = new Map([['a', 1]])
    expect(Array.from(clone(map))).to.deep.equal([['a', 1]])
    expect(clone(map)).to.not.equal(map)
  })
  it('sets', () => {
    const set = new Set([1])
    expect(Array.from(clone(set))).to.deep.equal([1])
    expect(clone(set)).to.not.equal(set)
  })
  it('nested maps', () => {
    const data = { m: new Map([['a', 1]]) }
    expect(Array.from(clone(data).m)).to.deep.equal([['a', 1]])
    expect(clone(data).m).to.not.equal(data.m)
  })
  it('nested sets', () => {
    const data = { s: new Set([1]) }
    expect(Array.from(clone(data).s)).to.deep.equal([1])
    expect((clone(data).s)).to.not.equal(data.s)
  })
  it('handles cycles properly', () => {
    const nodes = [
      { id: 1 },
      { id: 2 },
      { id: 3, parentId: 1 },
      { id: 4, parentId: 3 },
      { id: 5, parentId: 3 },
      { id: 6, parentId: 4 }
    ]
    const tree = treeify(nodes)
    const cloned = clone(tree)
    expect(equal(tree, cloned)).to.be.true
    expect(cloned[0].children![0].parent).to.equal(cloned[0])
  })
})
