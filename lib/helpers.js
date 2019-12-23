module.exports = {
  toMap: (arr, keySelector) =>
    arr.reduce((map, x) => {
      map[keySelector(x)] = x;
      return map;
    }, {}),
  flatten: arr => arr.reduce((acc, x) => [...acc, ...x], []),
};
