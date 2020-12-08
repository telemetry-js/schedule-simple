'use strict'

const MAX_SKEW_MS = 42

// Similar to setInterval, but rounds execution time to a multiple of `delay`
// and corrects cumulative drift on Node.js timers. This ensures metrics are
// collected at a reasonably predictable time, barring clock skew between
// machines. Background: https://github.com/nodejs/node/issues/21822.
module.exports = function setCorrectingInterval (fn, delay, opts) {
  let timer = null
  let clear = null
  let unref = false
  let cleared = false

  // Exposed for unit tests
  const _setInterval = (opts && opts.setInterval) || setInterval
  const _setTimeout = (opts && opts.setTimeout) || setTimeout
  const _clearInterval = (opts && opts.clearInterval) || clearInterval
  const _clearTimeout = (opts && opts.clearTimeout) || clearTimeout
  const _now = (opts && opts.now) || Date.now

  const schedule = function (fn, delay, repeat) {
    timer = repeat ? _setInterval(fn, delay) : _setTimeout(fn, delay)
    clear = repeat ? _clearInterval : _clearTimeout

    if (unref) timer.unref()
  }

  const corrected = function () {
    fn(true)

    if (!cleared) { // The fn itself may have called clear()
      schedule(repeated, delay, true)
    }
  }

  const repeated = function () {
    fn(false)

    if (!cleared && delay > MAX_SKEW_MS) {
      const lag = _now() % delay

      if (lag > MAX_SKEW_MS && delay - lag > MAX_SKEW_MS) {
        // Restart, firing a little sooner
        clear(timer)
        schedule(corrected, delay - lag, false)
      }
    }
  }

  // Start at the nearest multiple of `delay`
  schedule(corrected, delay - (_now() % delay), false)

  return {
    unref () {
      if (timer !== null) timer.unref()
      unref = true
    },

    ref () {
      if (timer !== null) timer.ref()
      unref = false
    },

    clear () {
      cleared = true
      if (clear !== null) clear(timer)
    }
  }
}

// Exposed for unit tests
module.exports.MAX_SKEW_MS = MAX_SKEW_MS
