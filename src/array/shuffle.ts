/**
 * fast O(n) non-mutating algorithm to shuffle an array
 */
export function shuffle<ObjectType> (shuffleArray: readonly ObjectType[]) {
  const copied = [...shuffleArray]
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = copied[i]
    copied[i] = copied[j]
    copied[j] = temp
  }
  return copied
}
