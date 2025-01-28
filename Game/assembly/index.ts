// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}
export function isColliding(
  x1: i32, y1: i32, w1: i32, h1: i32,
  x2: i32, y2: i32, w2: i32, h2: i32
): bool {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}
