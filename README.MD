# Usage

## Install

```bash
npm i -D swagger-interpretator
```

## Download swagger.json

Go to swagger page, click on the link to json. Save json into file on your computer.

## Start interpretator

Use command:
```bash
node .\node_modules\swagger-interpretator\index.js {path to swagger.json} '{url} {method}' {output file name} {api-module name}
```
Ex. 
```bash
node .\node_modules\swagger-interpretator\index.js "./swagger.json" '/api/candidate/matchings get' ./output.ts fetchMatchings
```