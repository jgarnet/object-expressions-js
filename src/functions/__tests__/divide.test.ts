import {describe, it, expect} from "@jest/globals";
import divide from "../divide";

describe('divide tests', () => {
    it('should divide primitive numbers', () => {
        expect(divide.evaluate({ expression: '', object: null }, 2, 2)).toEqual(1);
        expect(divide.evaluate({ expression: '', object: null }, 2, 4, 6)).toBeCloseTo(.0833);
        expect(divide.evaluate({ expression: '', object: null }, 1, 1)).toEqual(1);
    });
    it('should divide field values', () => {
        const context = { expression: '', object: { a: 2, b: 4, c: 6 } };
        expect(divide.evaluate(context, 'a', 'b')).toEqual(.5);
        expect(divide.evaluate(context, 'a', 'b', 'c')).toBeCloseTo(.0833);
    });
    it('should divide mixed values', () => {
        const context = { expression: '', object: { a: 2, b: 4, c: 6 } };
        expect(divide.evaluate(context, 'a', 2)).toEqual(1);
        expect(divide.evaluate(context, 2, 'a')).toEqual(1);
        expect(divide.evaluate(context, 2, 'a', 'b')).toEqual(.25);
    });
    it('should throw error if invalid number of arguments received', () => {
        const context = { expression: 'exp', object: { a: 2, b: 4, c: 6 } };
        expect(() => divide.evaluate(context)).toThrowError(new Error('SyntaxError: DIVIDE() received invalid arguments in exp'));
        expect(() => divide.evaluate(context, 1)).toThrowError(new Error('SyntaxError: DIVIDE() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', () => {
        const context = { expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } };
        expect(() => divide.evaluate(context, 2, 'a')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 'b')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 'c')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 'd')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 0)).toThrowError(new Error('EvaluationError: attempted to divide by zero in exp'));
    });
});