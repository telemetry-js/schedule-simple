# schedule-simple

> **Schedule plugin to collect metrics on a fixed interval.**  
> A [`telemetry`](https://github.com/telemetry-js/telemetry) plugin.

[![npm status](http://img.shields.io/npm/v/@telemetry-js/schedule-simple.svg)](https://www.npmjs.org/package/@telemetry-js/schedule-simple)
[![node](https://img.shields.io/node/v/@telemetry-js/schedule-simple.svg)](https://www.npmjs.org/package/@telemetry-js/schedule-simple)
[![Test](https://github.com/telemetry-js/schedule-simple/workflows/Test/badge.svg?branch=main)](https://github.com/telemetry-js/schedule-simple/actions)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Table of Contents

<details><summary>Click to expand</summary>

- [Usage](#usage)
- [API](#api)
  - [Options](#options)
- [Install](#install)
- [Acknowledgements](#acknowledgements)
- [License](#license)

</details>

## Usage

```js
const telemetry = require('@telemetry-js/telemetry')()
const simple = require('@telemetry-js/schedule-simple')

telemetry.task()
  .schedule(simple, { interval: '5m' })
```

## API

### Options

_Yet to document._

## Install

With [npm](https://npmjs.org) do:

```
npm install @telemetry-js/schedule-simple
```

## Acknowledgements

This project is kindly sponsored by [Reason Cybersecurity Ltd](https://reasonsecurity.com).

[![reason logo](https://cdn.reasonsecurity.com/github-assets/reason_signature_logo.png)](https://reasonsecurity.com)

## License

[MIT](LICENSE) © Vincent Weevers
