import {describe, it, expect} from "@jest/globals";
import divide from "../divide";
import createContext from "../../create-context";

describe('divide tests', () => {
    it('should divide primitive numbers', () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(divide.evaluate(createContext({ expression: '', object: null }), 2, 2)).toEqual(1);
        // noinspection TypeScriptValidateTypes
        expect(divide.evaluate(createContext({ expression: '', object: null }), 2, 4, 6)).toBeCloseTo(.0833);
        // noinspection TypeScriptValidateTypes
        expect(divide.evaluate(createContext({ expression: '', object: null }), 1, 1)).toEqual(1);
    });
    it('should divide field values', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(divide.evaluate(context, 'a', 'b')).toEqual(.5);
        expect(divide.evaluate(context, 'a', 'b', 'c')).toBeCloseTo(.0833);
    });
    it('should divide mixed values', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(divide.evaluate(context, 'a', 2)).toEqual(1);
        expect(divide.evaluate(context, 2, 'a')).toEqual(1);
        expect(divide.evaluate(context, 2, 'a', 'b')).toEqual(.25);
    });
    it('should throw error if invalid number of arguments received', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        expect(() => divide.evaluate(context)).toThrowError(new Error('SyntaxError: DIVIDE() received invalid arguments in exp'));
        expect(() => divide.evaluate(context, 1)).toThrowError(new Error('SyntaxError: DIVIDE() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        expect(() => divide.evaluate(context, 2, 'a')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 'b')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 'c')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 'd')).toThrowError(new Error('SyntaxError: DIVIDE() received non-numeric value in exp'));
        expect(() => divide.evaluate(context, 2, 0)).toThrowError(new Error('EvaluationError: attempted to divide by zero in exp'));
    });
});