import {describe, it, expect} from "@jest/globals";
import add from "../add";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";

describe('add tests', () => {
    it('should add primitive numbers', () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(add.evaluate(createContext({ expression: '', object: null }), 2, 2)).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(add.evaluate(createContext({ expression: '', object: null }), 2, 4, 6)).toEqual(12);
        // noinspection TypeScriptValidateTypes
        expect(add.evaluate(createContext({ expression: '', object: null }), 1, 1)).toEqual(2);
    });
    it('should add field values', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(add.evaluate(context, 'a', 'b')).toEqual(6);
        expect(add.evaluate(context, 'a', 'b', 'c')).toEqual(12);
    });
    it('should add mixed values', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(add.evaluate(context, 'a', 2)).toEqual(4);
        expect(add.evaluate(context, 2, 'a')).toEqual(4);
        expect(add.evaluate(context, 2, 'a', 'b')).toEqual(8);
    });
    it('should throw error if invalid number of arguments received', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        expect(() => add.evaluate(context)).toThrowError(new ExpressionError('ADD() received invalid arguments in exp'));
        expect(() => add.evaluate(context, 1)).toThrowError(new ExpressionError('ADD() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        expect(() => add.evaluate(context, 2, 'a')).toThrowError(new ExpressionError('ADD() received non-numeric value in exp'));
        expect(() => add.evaluate(context, 2, 'b')).toThrowError(new ExpressionError('ADD() received non-numeric value in exp'));
        expect(() => add.evaluate(context, 2, 'c')).toThrowError(new ExpressionError('ADD() received non-numeric value in exp'));
        expect(() => add.evaluate(context, 2, 'd')).toThrowError(new ExpressionError('ADD() received non-numeric value in exp'));
    });
});