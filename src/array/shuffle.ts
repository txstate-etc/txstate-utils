/**
 * fast O(n) non-mutating algorithm to shuffle an array
 */
export function shuffle<ObjectType> (shuffleArray: readonly ObjectType[]) {
  const copied = Array.from(shuffleArray)
  return shuffleInPlace(copied)
}

/**
 * fast O(n) mutating algorithm to shuffle an array
 */
export function shuffleInPlace<ObjectType> (shuffleArray: ObjectType[]) {
  for (let i = shuffleArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = shuffleArray[i]
    shuffleArray[i] = shuffleArray[j]
    shuffleArray[j] = temp
  }
  return shuffleArray
}
