function getArrayAgendaItems(arr, path) {
  return arr.map((e, i) => ({
    value: e,
    path: [...path, i]
  }));
}

function getObjectAgendaItems(obj, path) {
  return Object.entries(obj).map(([prop, value]) => ({
    value,
    path: [...path, prop]
  }))
}

function checkIsNotRecursive(value, path=[])  {
  if (path.includes(value)) {
    return false
  }
  if (typeof value !== 'object') {
    return true
  }
  return Object.entries(value)
    .every(([_, propValue]) => checkIsNotRecursive(propValue, [value, ...path]))
}

function bfs(value, action) {
  if (!checkIsNotRecursive(value)) {
    throw new TypeError('Value must be not recursive')
  }
  const agenda = [{ value, path: [], id: -1 }];
  while (agenda.length > 0) {
    const { value: currentValue, path: currentPath } = agenda.shift();

    const isContinue = action(currentValue, currentPath, value);

    if (isContinue === false) {
      return
    }

    if (!currentValue || isContinue === null) continue;
    if (Array.isArray(currentValue)) {
      agenda.push(...getArrayAgendaItems(currentValue, currentPath));
      continue
    }
    if (typeof currentValue === "object") {
      agenda.push(...getObjectAgendaItems(currentValue, currentPath));
    }
  }
}

module.exports = { bfs };
