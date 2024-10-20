export function toOptions(arr: (string | number)[]) {
  return arr.map((item) => ({
    label: String(item),
    value: String(item),
  }));
}
