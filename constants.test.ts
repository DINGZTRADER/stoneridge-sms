import { describe, it, expect } from 'vitest';
import { getUgandanGrade } from './constants';

describe('getUgandanGrade', () => {
  it('should return D1 for scores >= 80', () => {
    expect(getUgandanGrade(100)).toEqual({ grade: 'D1', description: 'Distinction 1' });
    expect(getUgandanGrade(85)).toEqual({ grade: 'D1', description: 'Distinction 1' });
    expect(getUgandanGrade(80)).toEqual({ grade: 'D1', description: 'Distinction 1' });
  });

  it('should return D2 for scores between 75 and 79', () => {
    expect(getUgandanGrade(79)).toEqual({ grade: 'D2', description: 'Distinction 2' });
    expect(getUgandanGrade(75)).toEqual({ grade: 'D2', description: 'Distinction 2' });
  });

  it('should return C3 for scores between 70 and 74', () => {
    expect(getUgandanGrade(74)).toEqual({ grade: 'C3', description: 'Credit 3' });
    expect(getUgandanGrade(70)).toEqual({ grade: 'C3', description: 'Credit 3' });
  });

  it('should return C4 for scores between 65 and 69', () => {
    expect(getUgandanGrade(69)).toEqual({ grade: 'C4', description: 'Credit 4' });
    expect(getUgandanGrade(65)).toEqual({ grade: 'C4', description: 'Credit 4' });
  });

  it('should return C5 for scores between 60 and 64', () => {
    expect(getUgandanGrade(64)).toEqual({ grade: 'C5', description: 'Credit 5' });
    expect(getUgandanGrade(60)).toEqual({ grade: 'C5', description: 'Credit 5' });
  });

  it('should return C6 for scores between 55 and 59', () => {
    expect(getUgandanGrade(59)).toEqual({ grade: 'C6', description: 'Credit 6' });
    expect(getUgandanGrade(55)).toEqual({ grade: 'C6', description: 'Credit 6' });
  });

  it('should return P7 for scores between 50 and 54', () => {
    expect(getUgandanGrade(54)).toEqual({ grade: 'P7', description: 'Pass 7' });
    expect(getUgandanGrade(50)).toEqual({ grade: 'P7', description: 'Pass 7' });
  });

  it('should return P8 for scores between 45 and 49', () => {
    expect(getUgandanGrade(49)).toEqual({ grade: 'P8', description: 'Pass 8' });
    expect(getUgandanGrade(45)).toEqual({ grade: 'P8', description: 'Pass 8' });
  });

  it('should return F9 for scores below 45', () => {
    expect(getUgandanGrade(44)).toEqual({ grade: 'F9', description: 'Fail 9' });
    expect(getUgandanGrade(0)).toEqual({ grade: 'F9', description: 'Fail 9' });
  });

  it('should round scores before grading', () => {
    expect(getUgandanGrade(74.5)).toEqual({ grade: 'D2', description: 'Distinction 2' });
    expect(getUgandanGrade(74.4)).toEqual({ grade: 'C3', description: 'Credit 3' });
  });

  it('should clamp scores to [0, 100]', () => {
    expect(getUgandanGrade(-10)).toEqual({ grade: 'F9', description: 'Fail 9' });
    expect(getUgandanGrade(110)).toEqual({ grade: 'D1', description: 'Distinction 1' });
  });
});
