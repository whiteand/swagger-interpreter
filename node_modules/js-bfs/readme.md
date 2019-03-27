# js-bfs

Package for breadth-first search on js value.

# Install

```bash
npm i --save js-bfs
```

# Usage

```javascript
import { bfs } from 'js-bfs'

const value = {
  a: {
    arr: [1,2,3,4],
    b: {
      c: '1'
    }
  }
}

let i = 0;
bfs(value, (node, path) => {
  console.log(++i, { node, path })
})
```

Output:
```javascript
1. { node: { a: { arr: [ 1, 2, 3, 4 ], b: { c: '1' } } }, path: [] }
2. { node: { arr: [ 1, 2, 3, 4 ], b: { c: '1' } },        path: [ 'a' ] }
3. { node: [ 1, 2, 3, 4 ],                                path: [ 'a', 'arr' ] }
4. { node: { c: '1' },                                    path: [ 'a', 'b' ] }
5. { node: 1,   path: [ 'a', 'arr', 0 ] }
6. { node: 2,   path: [ 'a', 'arr', 1 ] }
7. { node: 3,   path: [ 'a', 'arr', 2 ] }
8. { node: 4,   path: [ 'a', 'arr', 3 ] }
9. { node: '1', path: [ 'a', 'b', 'c' ] }
```

# End of search

If you want to stop search you should return `false` from callback.

```javascript
bfs([1,2,3,4,5,6], (node) => {
  console.log(node)
  if (node === 4) return false
})
```
Output:
```bash
[1,2,3,4,5,6]
1
2
3
4
```

If you want to restrict going deeper for this root you must return `null`.
```javascript
bfs([1,2,3,4,5,6], node => {
  console.log(node)
  if (Array.isArray(node)) return null
})
```
Output:
```bash
[1,2,3,4,5,6]
```

# Type

```typescript
bfs: (
  value: any,
  action: (
    value: any,
    path: string|number[],
    fullValue: any
  ) => any|false|null
) => void
```