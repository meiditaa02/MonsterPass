// tests/strengthCalculator.test.js
// Smoke tests for the StrengthCalculator module (task 2.7)

import { computeScore } from '../js/strengthCalculator.js';

describe('computeScore', () => {
  test('empty string → score 0, level Godlike', () => {
    expect(computeScore('')).toEqual({ score: 0, level: 'Godlike' });
  });

  test('single character → score 0, level Godlike', () => {
    expect(computeScore('a')).toEqual({ score: 0, level: 'Godlike' });
  });

  test('null → score 0, level Godlike', () => {
    expect(computeScore(null)).toEqual({ score: 0, level: 'Godlike' });
  });

  test('"aB3!" (4 criteria, length < 12) → score 4, level Scared', () => {
    expect(computeScore('aB3!')).toEqual({ score: 4, level: 'Scared' });
  });

  test('"aB3!aB3!aB3!" (4 criteria + length bonus) → score 5, level Defeated', () => {
    expect(computeScore('aB3!aB3!aB3!')).toEqual({ score: 5, level: 'Defeated' });
  });
});
