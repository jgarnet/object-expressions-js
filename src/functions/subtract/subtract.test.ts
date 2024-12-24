import {describe, it, expect} from "@jest/globals";
import subtract from "./subtract";
import createContext from "../../context/create-context";
import ExpressionError from "../../errors/expression-error";

describe('subtract tests', () => {
    it('should subtract primitive numbers', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await subtract.evaluate({ context: createContext({ expression: '', object: null }), args: [2, 2] })).toEqual(0);
        // noinspection TypeScriptValidateTypes
        expect(await subtract.evaluate({ context: createContext({ expression: '', object: null }), args: [2, 4, 6] })).toEqual(-8);
        // noinspection TypeScriptValidateTypes
        expect(await subtract.evaluate({ context: createContext({ expression: '', object: null }), args: [1, 1] })).toEqual(0);
    });
    it('should subtract field values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await subtract.evaluate({ context, args: ['2', '4'] })).toEqual(-2);
        expect(await subtract.evaluate({ context, args: [2, '4', 6] })).toEqual(-8);
    });
    it('should subtract mixed values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await subtract.evaluate({ context, args: [2, 2] })).toEqual(0);
        expect(await subtract.evaluate({ context, args: [2, 2] })).toEqual(0);
        expect(await subtract.evaluate({ context, args: [2, '2', '4'] })).toEqual(-4);
    });
    it('should throw error if invalid number of arguments received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        await expect(() => subtract.evaluate({ context, args: [] })).rejects.toThrowError(new ExpressionError('SUBTRACT() received invalid arguments in exp'));
        await expect(() => subtract.evaluate({ context, args: [1] })).rejects.toThrowError(new ExpressionError('SUBTRACT() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        await expect(() => subtract.evaluate({ context, args: [2, undefined] })).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric argument in expression: exp'));
        await expect(() => subtract.evaluate({ context, args: [2, 'test'] })).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric argument in expression: exp'));
        await expect(() => subtract.evaluate({ context, args: [2, {}] })).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric argument in expression: exp'));
        await expect(() => subtract.evaluate({ context, args: [2, true] })).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric argument in expression: exp'));
    });
});