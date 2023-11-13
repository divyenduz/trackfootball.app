import { formatDuration } from 'date-fns'

export const prettySecondsToString = (seconds: number) => {
  if (!Boolean(seconds)) {
    return '0h 0m 0s'
  }
  const duration = secondsToDuration(seconds)
  return prettyDuration(duration)
}

const prettyDuration = (duration: Duration): string => {
  const str = formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
  })
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' seconds', 's')
    .replace(' second', 's')
  if (str.length === 0) {
    return 'n/a'
  }
  return str
}

export const addDurations = (d1: Duration, d2: Duration): Duration => {
  const h1 = d1.hours || 0
  const m1 = d1.minutes || 0
  const s1 = d1.seconds || 0
  const h2 = d2.hours || 0
  const m2 = d2.minutes || 0
  const s2 = d2.seconds || 0
  return {
    hours: h1 + h2,
    minutes: m1 + m2,
    seconds: s1 + s2,
  }
}

export const durationToSeconds = (duration: Duration) => {
  const h = duration.hours || 0
  const m = duration.minutes || 0
  const s = duration.seconds || 0
  return h * 3600 + m * 60 + s
}

export const secondsToDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds - 3600 * h) / 60)
  const s = seconds - 3600 * h - 60 * m
  return {
    hours: h,
    minutes: m,
    seconds: s,
  }
}
