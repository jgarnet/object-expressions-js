import {describe, it, expect} from "@jest/globals";
import multiply from "../multiply";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";

describe('multiply tests', () => {
    it('should multiply primitive numbers', () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(multiply.evaluate(createContext({ expression: '', object: null }), 2, 2)).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(multiply.evaluate(createContext({ expression: '', object: null }), 2, 4, 6)).toEqual(48);
        // noinspection TypeScriptValidateTypes
        expect(multiply.evaluate(createContext({ expression: '', object: null }), 1, 1)).toEqual(1);
    });
    it('should multiply field values', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(multiply.evaluate(context, 'a', 'b')).toEqual(8);
        expect(multiply.evaluate(context, 'a', 'b', 'c')).toEqual(48);
    });
    it('should multiply mixed values', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(multiply.evaluate(context, 'a', 2)).toEqual(4);
        expect(multiply.evaluate(context, 2, 'a')).toEqual(4);
        expect(multiply.evaluate(context, 2, 'a', 'b')).toEqual(16);
    });
    it('should throw error if invalid number of arguments received', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        expect(() => multiply.evaluate(context)).toThrowError(new ExpressionError('MULTIPLY() received invalid arguments in exp'));
        expect(() => multiply.evaluate(context, 1)).toThrowError(new ExpressionError('MULTIPLY() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        expect(() => multiply.evaluate(context, 2, 'a')).toThrowError(new ExpressionError('MULTIPLY() received non-numeric value in exp'));
        expect(() => multiply.evaluate(context, 2, 'b')).toThrowError(new ExpressionError('MULTIPLY() received non-numeric value in exp'));
        expect(() => multiply.evaluate(context, 2, 'c')).toThrowError(new ExpressionError('MULTIPLY() received non-numeric value in exp'));
        expect(() => multiply.evaluate(context, 2, 'd')).toThrowError(new ExpressionError('MULTIPLY() received non-numeric value in exp'));
    });
});