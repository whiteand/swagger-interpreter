# Usage

## Install

```bash
npm i -g api-from
```

## Download swagger.json

Go to swagger page, click on the link to json. Save json into file on your computer.

## Start interpretator

Use command:
```bash
api-from {path to swagger.json} '{url} {method}' {output file name} {api-module name}
```
Ex. 
```bash
api-from ./swagger.json "matchings get" ./fetchMatchings.ts fetchMatchings
```