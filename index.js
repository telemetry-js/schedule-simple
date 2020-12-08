'use strict'

const EventEmitter = require('events').EventEmitter
const msOption = require('./lib/ms-option')
const setCorrectingInterval = require('./lib/interval')

module.exports = function plugin (options, task) {
  return new SimpleSchedule(options, task)
}

class SimpleSchedule extends EventEmitter {
  constructor (options, task) {
    super()

    if (!options) {
      options = {}
    }

    if (!task) {
      throw new TypeError('This plugin needs a "task" argument')
    }

    const interval = msOption(options.interval, 'interval')
    if (interval <= 0) throw new RangeError('The "interval" option must be > 0')

    this._unref = false
    this._timer = null
    this._pingInFlight = false
    this._stopAfterNextPing = false
    this._interval = interval
    this._pingTask = this._pingTask.bind(this)
    this._pingTaskCallback = this._pingTaskCallback.bind(this)
    this._task = task
  }

  start (callback) {
    this._timer = setCorrectingInterval(this._pingTask, this._interval)
    this._stopAfterNextPing = false

    if (this._unref) {
      this._timer.unref()
    }

    process.nextTick(callback)
  }

  _pingTask () {
    if (this._pingInFlight) {
      let name = '<Unknown>'

      // Requires telemetry >= 0.2.0
      if (typeof this._task.currentPingTarget === 'function') {
        name = this._task.currentPingTarget()
      }

      process.emitWarning(
        `Skipping scheduled ping because previous ping did not complete yet. Currently pinging: ${name}`,
        'TelemetryWarning'
      )

      return
    }

    if (this._stopAfterNextPing) {
      this._timer.clear()
      this._timer = null
    }

    this._pingInFlight = true
    this._task.ping(this._pingTaskCallback)
  }

  _pingTaskCallback (err) {
    this._pingInFlight = false

    // TODO (later): wrap error
    if (err) process.emitWarning(err)

    if (this._stopAfterNextPing) {
      this.emit('_stop')
    } else {
      this.emit('_ping')
    }
  }

  stop (callback) {
    if (this._pingInFlight) {
      this.once('_ping', () => {
        this.stop(callback)
      })
    } else {
      this._stopAfterNextPing = true
      this.once('_stop', callback)
    }
  }

  unref () {
    this._unref = true

    if (this._timer !== null) {
      this._timer.unref()
    }
  }
}
