/**
 * Included here as a sanity to check to ensure automated tests are working in the Github pipeline.
 * Can be removed when ACTUAL tests are in place.
 * @param {Number} a 
 * @param {Number} b 
 */
function sum(a, b) {
  return a + b;
}

test("Adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
