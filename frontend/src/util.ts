export function single<T>(array: Array<T>): T {
  if (array.length !== 1)
    throw new Error(`array must have exactly one element, has ${array.length}`);
  return array.at(0)!;
}

export function singleWhere<T>(
  array: Array<T>,
  filter: (value: T, index: number, array: T[]) => unknown,
): T {
  return single(array.filter(filter));
}
