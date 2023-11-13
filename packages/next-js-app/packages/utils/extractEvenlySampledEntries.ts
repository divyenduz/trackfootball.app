export function extractEvenlySampledEntries<T>(
  array: T[],
  numberOfSamples: number
) {
  const arrayLength = array.length

  // If N is less than or equal to M, return the original array
  if (arrayLength <= numberOfSamples) {
    return array
  }

  const sampledArray: T[] = []
  const step = arrayLength / numberOfSamples

  for (let i = 0; i < numberOfSamples; i++) {
    const index = Math.floor(i * step)
    sampledArray.push(array[index])
  }

  return sampledArray
}
