function toObject(array) {
  return array.reduce((o, item) => {
    o[item.name] = item;
    return o;
  }, {});
}

export { toObject };
