import {describe, it, expect} from "@jest/globals";
import multiply from "../multiply";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";

describe('multiply tests', () => {
    it('should multiply primitive numbers', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await multiply.evaluate(createContext({ expression: '', object: null }), 2, 2)).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(await multiply.evaluate(createContext({ expression: '', object: null }), 2, 4, 6)).toEqual(48);
        // noinspection TypeScriptValidateTypes
        expect(await multiply.evaluate(createContext({ expression: '', object: null }), 1, 1)).toEqual(1);
    });
    it('should multiply field values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await multiply.evaluate(context, '2', 4)).toEqual(8);
        expect(await multiply.evaluate(context, 2, '4', '6')).toEqual(48);
    });
    it('should multiply mixed values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await multiply.evaluate(context, '2', 2)).toEqual(4);
        expect(await multiply.evaluate(context, 2, 2)).toEqual(4);
        expect(await multiply.evaluate(context, 2, '2', '4')).toEqual(16);
    });
    it('should throw error if invalid number of arguments received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        await expect(() => multiply.evaluate(context)).rejects.toThrowError(new ExpressionError('MULTIPLY() received invalid arguments in exp'));
        await expect(() => multiply.evaluate(context, 1)).rejects.toThrowError(new ExpressionError('MULTIPLY() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        await expect(() => multiply.evaluate(context, 2, undefined)).rejects.toThrowError(new ExpressionError('MULTIPLY() received non-numeric argument in expression: exp'));
        await expect(() => multiply.evaluate(context, 2, 'test')).rejects.toThrowError(new ExpressionError('MULTIPLY() received non-numeric argument in expression: exp'));
        await expect(() => multiply.evaluate(context, 2, {})).rejects.toThrowError(new ExpressionError('MULTIPLY() received non-numeric argument in expression: exp'));
        await expect(() => multiply.evaluate(context, 2, true)).rejects.toThrowError(new ExpressionError('MULTIPLY() received non-numeric argument in expression: exp'));
    });
});