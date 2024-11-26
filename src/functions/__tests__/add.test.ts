import {describe, it, expect} from "@jest/globals";
import add from "../add";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";

describe('add tests', () => {
    it('should add primitive numbers', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await add.evaluate(createContext({ expression: '', object: null }), 2, 2)).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(await add.evaluate(createContext({ expression: '', object: null }), 2, 4, 6)).toEqual(12);
        // noinspection TypeScriptValidateTypes
        expect(await add.evaluate(createContext({ expression: '', object: null }), 1, 1)).toEqual(2);
    });
    it('should add field values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await add.evaluate(context, 2, 4)).toEqual(6);
        expect(await add.evaluate(context, 2, 4, 6)).toEqual(12);
    });
    it('should add mixed values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await add.evaluate(context, 2, 2)).toEqual(4);
        expect(await add.evaluate(context, 2, 2)).toEqual(4);
        expect(await add.evaluate(context, 2, 2, 4)).toEqual(8);
    });
    it('should throw error if invalid number of arguments received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        await expect(() => add.evaluate(context)).rejects.toThrowError(new ExpressionError('ADD() received invalid arguments in exp'));
        await expect(() => add.evaluate(context, 1)).rejects.toThrowError(new ExpressionError('ADD() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        await expect(() => add.evaluate(context, 2, 'a')).rejects.toThrowError(new ExpressionError('ADD() received non-numeric argument in expression: exp'));
        await expect(() => add.evaluate(context, 2, 'b')).rejects.toThrowError(new ExpressionError('ADD() received non-numeric argument in expression: exp'));
        await expect(() => add.evaluate(context, 2, 'c')).rejects.toThrowError(new ExpressionError('ADD() received non-numeric argument in expression: exp'));
        await expect(() => add.evaluate(context, 2, 'd')).rejects.toThrowError(new ExpressionError('ADD() received non-numeric argument in expression: exp'));
    });
});