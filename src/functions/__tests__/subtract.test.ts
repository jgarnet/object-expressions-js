import {describe, it, expect} from "@jest/globals";
import subtract from "../subtract";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";

describe('subtract tests', () => {
    it('should subtract primitive numbers', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await subtract.evaluate(createContext({ expression: '', object: null }), 2, 2)).toEqual(0);
        // noinspection TypeScriptValidateTypes
        expect(await subtract.evaluate(createContext({ expression: '', object: null }), 2, 4, 6)).toEqual(-8);
        // noinspection TypeScriptValidateTypes
        expect(await subtract.evaluate(createContext({ expression: '', object: null }), 1, 1)).toEqual(0);
    });
    it('should subtract field values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await subtract.evaluate(context, 'a', 'b')).toEqual(-2);
        expect(await subtract.evaluate(context, 'a', 'b', 'c')).toEqual(-8);
    });
    it('should subtract mixed values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await subtract.evaluate(context, 'a', 2)).toEqual(0);
        expect(await subtract.evaluate(context, 2, 'a')).toEqual(0);
        expect(await subtract.evaluate(context, 2, 'a', 'b')).toEqual(-4);
    });
    it('should throw error if invalid number of arguments received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        await expect(() => subtract.evaluate(context)).rejects.toThrowError(new ExpressionError('SUBTRACT() received invalid arguments in exp'));
        await expect(() => subtract.evaluate(context, 1)).rejects.toThrowError(new ExpressionError('SUBTRACT() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        await expect(() => subtract.evaluate(context, 2, 'a')).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric value in exp'));
        await expect(() => subtract.evaluate(context, 2, 'b')).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric value in exp'));
        await expect(() => subtract.evaluate(context, 2, 'c')).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric value in exp'));
        await expect(() => subtract.evaluate(context, 2, 'd')).rejects.toThrowError(new ExpressionError('SUBTRACT() received non-numeric value in exp'));
    });
});