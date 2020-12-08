'use strict'

const test = require('tape')
const plugin = require('.')
const setCorrectingInterval = require('./lib/interval')

test('start and stop', function (t) {
  t.plan(4)

  let pinged = false

  const mockTask = {
    ping (callback) {
      t.pass('waited for ping before stopping')
      pinged = true
      process.nextTick(callback)
    }
  }

  const schedule = plugin({ interval: '200ms' }, mockTask)

  schedule.start((err) => {
    t.ifError(err, 'no start error')
    t.is(pinged, false, 'did not ping yet')

    schedule.stop((err) => {
      t.ifError(err, 'no stop error')
    })
  })
})

test('start and stop during ping', function (t) {
  t.plan(5)

  let pinged = false

  const mockTask = {
    ping (callback) {
      if (!pinged) {
        t.pass('first ping')

        schedule.stop((err) => {
          t.ifError(err, 'no stop error')
        })
      } else {
        t.pass('waited for another ping before stopping')
      }

      pinged = true
      process.nextTick(callback)
    }
  }

  const schedule = plugin({ interval: '200ms' }, mockTask)

  schedule.start((err) => {
    t.ifError(err, 'no start error')
    t.is(pinged, false, 'did not ping yet')
  })
})

test('start and stop during ping (2)', function (t) {
  t.plan(5)

  let pinged = false

  const mockTask = {
    ping (callback) {
      if (!pinged) {
        t.pass('first ping')

        schedule.stop((err) => {
          t.ifError(err, 'no stop error')
        })
      } else {
        t.pass('waited for another ping before stopping')
      }

      pinged = true

      // Release zalgo intentionally
      callback()
    }
  }

  const schedule = plugin({ interval: '200ms' }, mockTask)

  schedule.start((err) => {
    t.ifError(err, 'no start error')
    t.is(pinged, false, 'did not ping yet')
  })
})

test('corrects lag', function (t) {
  t.plan(11)

  const opts = {}
  const calls = [
    ['now', () => 1000],
    ['setTimeout', (fn, delay) => {
      t.is(delay, 1000, 'timer 1')
      process.nextTick(fn)
      return 1
    }],
    ['fn'],
    ['setInterval', (fn, delay) => {
      t.is(delay, 1000, 'timer 2')
      process.nextTick(fn)
      return 2
    }],
    ['fn'],
    ['now', () => 3000 - setCorrectingInterval.MAX_SKEW_MS - 1],
    ['clearInterval'],
    ['setTimeout', (fn, delay) => {
      t.is(delay, setCorrectingInterval.MAX_SKEW_MS + 1, 'corrected')
    }]
  ]

  for (const name of ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'now']) {
    opts[name] = mock(t, calls, name)
  }

  setCorrectingInterval(mock(t, calls, 'fn'), 1000, opts)
})

test('does not correct lag smaller than MAX_SKEW_MS', function (t) {
  t.plan(8)

  const opts = {}
  const calls = [
    ['now', () => 1000],
    ['setTimeout', (fn, delay) => {
      t.is(delay, 1000, 'timer 1')
      process.nextTick(fn)
      return 1
    }],
    ['fn'],
    ['setInterval', (fn, delay) => {
      t.is(delay, 1000, 'timer 2')
      process.nextTick(fn)
      return 2
    }],
    ['fn'],
    ['now', () => 3000 - setCorrectingInterval.MAX_SKEW_MS] // Should not be corrected
  ]

  for (const name of ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'now']) {
    opts[name] = mock(t, calls, name)
  }

  setCorrectingInterval(mock(t, calls, 'fn'), 1000, opts)
})

function mock (t, calls, name) {
  return function (...args) {
    if (!calls.length) {
      return t.fail('did not expect call: ' + name)
    }

    const [expectedName, impl] = calls.shift()
    t.is(name, expectedName, 'called ' + expectedName)

    if (impl) return impl(...args)
  }
}
