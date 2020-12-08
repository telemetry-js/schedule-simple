'use strict'

const ms = require('ms')

// TODO: use bruce-millis instead
module.exports = function (value, name) {
  if (typeof value === 'number') {
    if (Number.isFinite(value)) {
      return value
    }
  } else if (typeof value === 'string') {
    return ms(value)
  }

  throw new TypeError(
    `The "${name}" option must be a finite number (e.g. 1000) or string ("1s")`
  )
}
