# Parse dependencies

[![Greenkeeper badge](https://badges.greenkeeper.io/hisco/dependencies-trace.svg)](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

  Find your code dependencies, supports typescript, javascript and coffe script
# Dependencies trace
A simple and naive approach to trace your code dependecies.
It's very fast and uses only a single regex execution per file.

## Motivation
While the *correct* way to trace dependecies is by using some sort of AST analyzer this will require more computions then using a single regex execution per file.

`dependencies-trace` was built for performance *over accuracy* and it's doing best effort to find all dependencies of your file.
If you find scenarios that `dependencies-trace` couldn't find your dependencies - open an issue in the github repo and I will do my best effort to fix it.

## Simple to use
```js
  const {tsImports,coffeImports} = require('dependencies-trace');
  
  const tsExample = `
  import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
  `
  const coffeExample = `
    const {a} = require "jquery";
  `

  console.log(tsImports(tsExample));
  //-> ./ZipCodeValidator
   console.log(coffeImports(coffeExample));
  //-> jquery
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/dependencies-trace.svg
[npm-url]: https://npmjs.org/package/dependencies-trace
[travis-image]: https://img.shields.io/travis/hisco/dependencies-trace/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/dependencies-trace
[coveralls-image]: https://coveralls.io/repos/github/hisco/dependencies-trace/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/hisco/dependencies-trace?branch=master
