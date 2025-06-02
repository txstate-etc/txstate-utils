/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { Queue, PriorityQueue } from '../lib'

describe('queue', () => {
  it('accepts random data and dequeues it first-in-first-out', () => {
    const data: number[] = []
    for (let i = 0; i < 100; i++) {
      data.push(Math.floor(100 * Math.random()))
    }
    const queue = new Queue<number>()
    for (let i = 0; i < data.length; i++) queue.enqueue(data[i])

    const result = Array.from(queue)
    expect(result).to.deep.equal(data)
  })
})

describe('priority queue', () => {
  it('should accept random data and iterate it back in sorted order', () => {
    const data: number[] = []
    for (let i = 0; i < 100; i++) {
      data.push(Math.floor(100 * Math.random()))
    }
    const sorted = data.slice().sort((a, b) => a - b)

    const queue = new PriorityQueue<number>()
    for (let i = 0; i < data.length; i++) queue.enqueue(data[i])

    const result = Array.from(queue)
    expect(result).to.deep.equal(sorted)
  })

  it('should dequeue items in prioritized order', () => {
    const queue = new PriorityQueue()

    queue.enqueue(2)
    queue.enqueue(1)
    expect(queue.dequeue()).to.equal(1)
    expect(queue.dequeue()).to.equal(2)
    expect(queue.dequeue()).to.equal(undefined)
  })
  it('should dequeue a new item immediately if it is smaller than currently queued items', () => {
    const queue = new PriorityQueue()
    queue.enqueue(2)
    queue.enqueue(3)
    queue.enqueue(1)
    expect(queue.dequeue()).to.equal(1)
    expect(queue.dequeue()).to.equal(2)
    queue.enqueue(1)
    expect(queue.dequeue()).to.equal(1)
    expect(queue.dequeue()).to.equal(3)
    expect(queue.dequeue()).to.equal(undefined)
  })
  it('should dequeue items in prioritized order when priority comes from a custom extractor string', () => {
    const queue = new PriorityQueue<{ priority: number }>('priority')
    queue.enqueue({ priority: 2 })
    queue.enqueue({ priority: 1 })
    expect(queue.dequeue()).to.deep.equal({ priority: 1 })
    expect(queue.dequeue()).to.deep.equal({ priority: 2 })
    expect(queue.dequeue()).to.equal(undefined)
  })
  it('should dequeue items in prioritized order when priority comes from a custom extractor function', () => {
    const queue = new PriorityQueue<{ priority: number }>((item) => item.priority)
    queue.enqueue({ priority: 2 })
    queue.enqueue({ priority: 1 })
    expect(queue.dequeue()).to.deep.equal({ priority: 1 })
    expect(queue.dequeue()).to.deep.equal({ priority: 2 })
    expect(queue.dequeue()).to.equal(undefined)
  })
})
