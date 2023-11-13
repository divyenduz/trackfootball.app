export const kmphToMps = (value: number) => {
  return (value / 3.6).toFixed(2)
}

export const mpsToKmph = (value: number) => {
  return (value * 3.6).toFixed(2)
}

export const metersToKilometers = (value: number) => {
  return (value / 1000).toFixed(2)
}
