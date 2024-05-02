export default function flatten(value) {
  const result = value;
  while (result.some(item => Array.isArray(item))) {
    result = [].concat(...result);
  }

  return result;
}

// In-Place Solution
export default function flatten(value) {
  let i = 0;
  while (i < value.length) {
    if (Array.isArray(value[i])) {
      value.splice(i, 1, ...value[i]);
    } else {
      i++;
    }
  }

  return value;
}