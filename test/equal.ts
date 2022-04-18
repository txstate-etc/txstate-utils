/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { equal } from '../lib'

describe('deep equal', () => {
  describe('scalars', () => {
    it('equal numbers', () => {
      expect(equal(1, 1)).to.be.true
    })
    it('not equal numbers', () => {
      expect(equal(1, 2)).to.be.false
    })
    it('number and array are not equal', () => {
      expect(equal(1, [])).to.be.false
    })
    it('0 and null are not equal', () => {
      expect(equal(0, null)).to.be.false
    })
    it('equal strings', () => {
      expect(equal('a', 'a')).to.be.true
    })
    it('not equal strings', () => {
      expect(equal('a', 'b')).to.be.false
    })
    it('empty string and null are not equal', () => {
      expect(equal('', null)).to.be.false
    })
    it('null is equal to null', () => {
      expect(equal(null, null)).to.be.true
    })
    it('equal booleans (true)', () => {
      expect(equal(true, true)).to.be.true
    })
    it('equal booleans (false)', () => {
      expect(equal(false, false)).to.be.true
    })
    it('not equal booleans', () => {
      expect(equal(true, false)).to.be.false
    })
    it('1 and true are not equal', () => {
      expect(equal(1, true)).to.be.false
    })
    it('0 and false are not equal', () => {
      expect(equal(0, false)).to.be.false
    })
    it('NaN and NaN are equal', () => {
      expect(equal(NaN, NaN)).to.be.true
    })
    it('0 and -0 are equal', () => {
      expect(equal(0, -0)).to.be.true
    })
    it('Infinity and Infinity are equal', () => {
      expect(equal(Infinity, Infinity)).to.be.true
    })
    it('Infinity and -Infinity are not equal', () => {
      expect(equal(Infinity, -Infinity)).to.be.false
    })
  })

  describe('objects', () => {
    it('empty objects are equal', () => {
      expect(equal({}, {})).to.be.true
    })
    it('equal objects (same properties "order")', () => {
      expect(equal({ a: 1, b: '2' }, { a: 1, b: '2' })).to.be.true
    })
    it('equal objects (different properties "order")', () => {
      expect(equal({ a: 1, b: '2' }, { b: '2', a: 1 })).to.be.true
    })
    it('not equal objects (extra property)', () => {
      expect(equal({ a: 1, b: '2' }, { a: 1, b: '2', c: [] })).to.be.false
    })
    it('not equal objects (different property values)', () => {
      expect(equal({ a: 1, b: '2', c: 3 }, { a: 1, b: '2', c: 4 })).to.be.false
    })
    it('not equal objects (different properties)', () => {
      expect(equal({ a: 1, b: '2', c: 3 }, { a: 1, b: '2', d: 3 })).to.be.false
    })
    it('equal objects (same sub-properties)', () => {
      expect(equal({ a: [{ b: 'c' }] }, { a: [{ b: 'c' }] })).to.be.true
    })
    it('not equal objects (different sub-property value)', () => {
      expect(equal({ a: [{ b: 'c' }] }, { a: [{ b: 'd' }] })).to.be.false
    })
    it('not equal objects (different sub-property)', () => {
      expect(equal({ a: [{ b: 'c' }] }, { a: [{ c: 'c' }] })).to.be.false
    })
    it('empty array and empty object are not equal', () => {
      expect(equal({}, [])).to.be.false
    })
    it('object with extra undefined properties are not equal #1', () => {
      expect(equal({}, { foo: undefined })).to.be.false
    })
    it('object with extra undefined properties are not equal #2', () => {
      expect(equal({ foo: undefined }, {})).to.be.false
    })
    it('object with extra undefined properties are not equal #3', () => {
      expect(equal({ foo: undefined }, { bar: undefined })).to.be.false
    })
    it('nulls are equal', () => {
      expect(equal(null, null)).to.be.true
    })
    it('null and undefined are not equal', () => {
      expect(equal(null, undefined)).to.be.false
    })
    it('null and empty object are not equal', () => {
      expect(equal(null, {})).to.be.false
    })
    it('undefined and empty object are not equal', () => {
      expect(equal(undefined, {})).to.be.false
    })
    it('objects with different `toString` functions returning same values are equal', () => {
      expect(equal({ toString: () => 'Hello world!' }, { toString: () => 'Hello world!' })).to.be.true
    })
    it('objects with `toString` functions returning different values are not equal', () => {
      expect(equal({ toString: () => 'Hello world!' }, { toString: () => 'Hi!' })).to.be.false
    })
  })

  describe('arrays', () => {
    it('two empty arrays are equal', () => {
      expect(equal([], [])).to.be.true
    })
    it('equal arrays', () => {
      expect(equal([1, 2, 3], [1, 2, 3])).to.be.true
    })
    it('not equal arrays (different item)', () => {
      expect(equal([1, 2, 3], [1, 2, 4])).to.be.false
    })
    it('not equal arrays (different length)', () => {
      expect(equal([1, 2, 3], [1, 2])).to.be.false
    })
    it('equal arrays of objects', () => {
      expect(equal([{ a: 'a' }, { b: 'b' }], [{ a: 'a' }, { b: 'b' }])).to.be.true
    })
    it('not equal arrays of objects', () => {
      expect(equal([{ a: 'a' }, { b: 'b' }], [{ a: 'a' }, { b: 'c' }])).to.be.false
    })
    it('pseudo array and equivalent array are not equal', () => {
      expect(equal({ 0: 0, 1: 1, length: 2 }, [0, 1])).to.be.false
    })
  })

  describe('Date objects', () => {
    it('equal date objects', () => {
      expect(equal(new Date('2017-06-16T21:36:48.362Z'), new Date('2017-06-16T21:36:48.362Z'))).to.be.true
    })
    it('not equal date objects', () => {
      expect(equal(new Date('2017-06-16T21:36:48.362Z'), new Date('2017-01-01T00:00:00.000Z'))).to.be.false
    })
    it('date and string are not equal', () => {
      expect(equal(new Date('2017-06-16T21:36:48.362Z'), '2017-06-16T21:36:48.362Z')).to.be.false
    })
    it('date and object are not equal', () => {
      expect(equal(new Date('2017-06-16T21:36:48.362Z'), {})).to.be.false
    })
  })

  describe('RegExp objects', () => {
    it('equal RegExp objects', () => {
      expect(equal(/foo/, /foo/)).to.be.true
    })
    it('not equal RegExp objects (different pattern)', () => {
      expect(equal(/foo/, /bar/)).to.be.false
    })
    it('not equal RegExp objects (different flags)', () => {
      expect(equal(/foo/, /foo/i)).to.be.false
    })
    it('RegExp and string are not equal', () => {
      expect(equal(/foo/, 'foo')).to.be.false
    })
    it('RegExp and object are not equal', () => {
      expect(equal(/foo/, {})).to.be.false
    })
  })

  describe('functions', () => {
    function func1 () {}
    function func2 () {}
    it('same function is equal', () => {
      expect(equal(func1, func1)).to.be.true
    })
    it('different functions are not equal', () => {
      expect(equal(func1, func2)).to.be.false
    })
  })

  describe('sample objects', () => {
    const value1 = {
      prop1: 'value1',
      prop2: 'value2',
      prop3: 'value3',
      prop4: {
        subProp1: 'sub value1',
        subProp2: {
          subSubProp1: 'sub sub value1',
          subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5]
        }
      },
      prop5: 1000,
      prop6: new Date(2016, 2, 10)
    }
    it('big object equal', () => {
      const value2 = {
        prop5: 1000,
        prop3: 'value3',
        prop1: 'value1',
        prop2: 'value2',
        prop6: new Date('2016/03/10'),
        prop4: {
          subProp2: {
            subSubProp1: 'sub sub value1',
            subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5]
          },
          subProp1: 'sub value1'
        }
      }
      expect(equal(value1, value2)).to.be.true
    })
    it('big object not equal', () => {
      const value2 = {
        prop5: 1000,
        prop3: 'value3',
        prop1: 'value1',
        prop2: 'value2',
        prop6: new Date('2016/03/10'),
        prop4: {
          subProp2: {
            subSubProp1: 'sub sub value1',
            subSubProp2: [1, { prop2: 1, prop: 2 }, 4, 5]
          },
          subProp1: 'sub value1'
        }
      }
      expect(equal(value1, value2)).to.be.false
    })
  })
  describe('cycles', () => {
    interface Node {
      id: number
      parentId?: number
      parent?: this
      children?: this[]
    }
    function treeify (nodes: Node[]) {
      const roots: Node[] = []
      for (const node of nodes) {
        if (!node.parentId) roots.push(node)
        else {
          node.parent = nodes.find(n => n.id === node.parentId)!
          node.parent.children ??= []
          node.parent.children.push(node)
        }
      }
      return roots
    }
    it('should not error out on two objects with cycles', () => {
      const nodes1 = [
        { id: 1 },
        { id: 2 },
        { id: 3, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 5, parentId: 3 },
        { id: 6, parentId: 4 }
      ]
      const nodes2 = [
        { id: 1 },
        { id: 2 },
        { id: 3, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 5, parentId: 3 },
        { id: 6, parentId: 4 },
        { id: 7 }
      ]
      const roots1 = treeify(nodes1)
      const roots2 = treeify(nodes2)
      expect(roots1).to.have.lengthOf(2)
      expect(roots2).to.have.lengthOf(3)
      expect(equal(roots1, roots2)).to.be.false
    })
    it('should not error out on one object with cycles', () => {
      const nodes1 = [
        { id: 1 },
        { id: 2 },
        { id: 3, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 5, parentId: 3 },
        { id: 6, parentId: 4 }
      ]
      const nodes2 = [
        { id: 1 },
        { id: 2 },
        { id: 7 }
      ]
      expect(equal(treeify(nodes1), treeify(nodes2))).to.be.false
    })
    it('should not error out on identical objects with cycles', () => {
      const nodes1 = [
        { id: 1 },
        { id: 2 },
        { id: 3, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 5, parentId: 3 },
        { id: 6, parentId: 4 }
      ]
      const nodes2 = [
        { id: 1 },
        { id: 2 },
        { id: 3, parentId: 1 },
        { id: 4, parentId: 3 },
        { id: 5, parentId: 3 },
        { id: 6, parentId: 4 }
      ]
      expect(equal(treeify(nodes1), treeify(nodes2))).to.be.true
    })
  })
})
