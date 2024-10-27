import {describe, it, expect} from "@jest/globals";
import multiply from "../multiply";

describe('multiply tests', () => {
    it('should multiply primitive numbers', () => {
        expect(multiply.evaluate({ expression: '', object: null }, 2, 2)).toEqual(4);
        expect(multiply.evaluate({ expression: '', object: null }, 2, 4, 6)).toEqual(48);
        expect(multiply.evaluate({ expression: '', object: null }, 1, 1)).toEqual(1);
    });
    it('should multiply field values', () => {
        const context = { expression: '', object: { a: 2, b: 4, c: 6 } };
        expect(multiply.evaluate(context, 'a', 'b')).toEqual(8);
        expect(multiply.evaluate(context, 'a', 'b', 'c')).toEqual(48);
    });
    it('should multiply mixed values', () => {
        const context = { expression: '', object: { a: 2, b: 4, c: 6 } };
        expect(multiply.evaluate(context, 'a', 2)).toEqual(4);
        expect(multiply.evaluate(context, 2, 'a')).toEqual(4);
        expect(multiply.evaluate(context, 2, 'a', 'b')).toEqual(16);
    });
    it('should throw error if invalid number of arguments received', () => {
        const context = { expression: 'exp', object: { a: 2, b: 4, c: 6 } };
        expect(() => multiply.evaluate(context)).toThrowError(new Error('SyntaxError: MULTIPLY() received invalid arguments in exp'));
        expect(() => multiply.evaluate(context, 1)).toThrowError(new Error('SyntaxError: MULTIPLY() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', () => {
        const context = { expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } };
        expect(() => multiply.evaluate(context, 2, 'a')).toThrowError(new Error('SyntaxError: MULTIPLY() received non-numeric value in exp'));
        expect(() => multiply.evaluate(context, 2, 'b')).toThrowError(new Error('SyntaxError: MULTIPLY() received non-numeric value in exp'));
        expect(() => multiply.evaluate(context, 2, 'c')).toThrowError(new Error('SyntaxError: MULTIPLY() received non-numeric value in exp'));
        expect(() => multiply.evaluate(context, 2, 'd')).toThrowError(new Error('SyntaxError: MULTIPLY() received non-numeric value in exp'));
    });
});