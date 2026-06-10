export function spanAt(spans: number[], index?: number) {
  return typeof index === "number" ? spans[index] ?? 1 : 1;
}

export function buildRowSpans<T>(rows: T[], getKey: (row: T) => string) {
  const spans = Array(rows.length).fill(1);
  let start = 0;

  for (let index = 1; index <= rows.length; index += 1) {
    if (index < rows.length && getKey(rows[index]) === getKey(rows[start])) {
      continue;
    }

    const span = index - start;
    spans[start] = span;

    for (let hidden = start + 1; hidden < index; hidden += 1) {
      spans[hidden] = 0;
    }

    start = index;
  }

  return spans;
}
