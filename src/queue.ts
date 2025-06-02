class Node<ValueType> {
  value: ValueType
  next?: Node<ValueType>

  constructor (value: ValueType) {
    this.value = value
  }
}

export class Queue<ValueType = any> {
  #head?: Node<ValueType>
  #tail?: Node<ValueType>
  #size = 0

  enqueue (value: ValueType) {
    const node = new Node<ValueType>(value)

    if (this.#head) {
      this.#tail!.next = node
      this.#tail = node
    } else {
      this.#head = node
      this.#tail = node
    }

    this.#size++
  }

  dequeue () {
    if (!this.#head) return

    const current = this.#head
    this.#head = this.#head.next
    this.#size--
    return current.value
  }

  peek () {
    return this.#head?.value
  }

  clear () {
    this.#head = undefined
    this.#tail = undefined
    this.#size = 0
  }

  get size () {
    return this.#size
  }

  * [Symbol.iterator] (): Generator<ValueType> {
    let current = this.#head

    while (current) {
      yield current.value
      current = current.next
    }
  }
}
