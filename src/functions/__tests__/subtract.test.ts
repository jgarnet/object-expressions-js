import {describe, it, expect} from "@jest/globals";
import subtract from "../subtract";

describe('add tests', () => {
    it('should subtract primitive numbers', () => {
        expect(subtract.evaluate({ expression: '', object: null }, 2, 2)).toEqual(0);
        expect(subtract.evaluate({ expression: '', object: null }, 2, 4, 6)).toEqual(-8);
        expect(subtract.evaluate({ expression: '', object: null }, 1, 1)).toEqual(0);
    });
    it('should subtract field values', () => {
        const context = { expression: '', object: { a: 2, b: 4, c: 6 } };
        expect(subtract.evaluate(context, 'a', 'b')).toEqual(-2);
        expect(subtract.evaluate(context, 'a', 'b', 'c')).toEqual(-8);
    });
    it('should subtract mixed values', () => {
        const context = { expression: '', object: { a: 2, b: 4, c: 6 } };
        expect(subtract.evaluate(context, 'a', 2)).toEqual(0);
        expect(subtract.evaluate(context, 2, 'a')).toEqual(0);
        expect(subtract.evaluate(context, 2, 'a', 'b')).toEqual(-4);
    });
    it('should throw error if invalid number of arguments received', () => {
        const context = { expression: 'exp', object: { a: 2, b: 4, c: 6 } };
        expect(() => subtract.evaluate(context)).toThrowError(new Error('SyntaxError: SUBTRACT() received invalid arguments in exp'));
        expect(() => subtract.evaluate(context, 1)).toThrowError(new Error('SyntaxError: SUBTRACT() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', () => {
        const context = { expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } };
        expect(() => subtract.evaluate(context, 2, 'a')).toThrowError(new Error('SyntaxError: SUBTRACT() received non-numeric value in exp'));
        expect(() => subtract.evaluate(context, 2, 'b')).toThrowError(new Error('SyntaxError: SUBTRACT() received non-numeric value in exp'));
        expect(() => subtract.evaluate(context, 2, 'c')).toThrowError(new Error('SyntaxError: SUBTRACT() received non-numeric value in exp'));
        expect(() => subtract.evaluate(context, 2, 'd')).toThrowError(new Error('SyntaxError: SUBTRACT() received non-numeric value in exp'));
    });
});