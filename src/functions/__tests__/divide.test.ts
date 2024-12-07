import {describe, it, expect} from "@jest/globals";
import divide from "../divide";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";

describe('divide tests', () => {
    it('should divide primitive numbers', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await divide.evaluate({ context: createContext({ expression: '', object: null }), args: [2, 2] })).toEqual(1);
        // noinspection TypeScriptValidateTypes
        expect(await divide.evaluate({ context: createContext({ expression: '', object: null }), args: [2, 4, 6] })).toBeCloseTo(.0833);
        // noinspection TypeScriptValidateTypes
        expect(await divide.evaluate({ context: createContext({ expression: '', object: null }), args: [1, 1] })).toEqual(1);
    });
    it('should divide field values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await divide.evaluate({ context, args: [2, '4'] })).toEqual(.5);
        expect(await divide.evaluate({ context, args: [2, 4, 6] })).toBeCloseTo(.0833);
    });
    it('should divide mixed values', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: '', object: { a: 2, b: 4, c: 6 } });
        expect(await divide.evaluate({ context, args: [2, 2] })).toEqual(1);
        expect(await divide.evaluate({ context, args: [2, '2'] })).toEqual(1);
        expect(await divide.evaluate({ context, args: [2, '2', '4'] })).toEqual(.25);
    });
    it('should throw error if invalid number of arguments received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: 2, b: 4, c: 6 } });
        await expect(() => divide.evaluate({ context, args: [] })).rejects.toThrowError(new ExpressionError('DIVIDE() received invalid arguments in exp'));
        await expect(() => divide.evaluate({ context, args: [1] })).rejects.toThrowError(new ExpressionError('DIVIDE() received invalid arguments in exp'));
    });
    it('should throw error if invalid argument received', async () => {
        // noinspection TypeScriptValidateTypes
        const context = createContext({ expression: 'exp', object: { a: undefined, b: 'test', c: {}, d: true } });
        await expect(() => divide.evaluate({ context, args: [2, undefined] })).rejects.toThrowError(new ExpressionError('DIVIDE() received non-numeric argument in expression: exp'));
        await expect(() => divide.evaluate({ context, args: [2, 'test'] })).rejects.toThrowError(new ExpressionError('DIVIDE() received non-numeric argument in expression: exp'));
        await expect(() => divide.evaluate({ context, args: [2, {}] })).rejects.toThrowError(new ExpressionError('DIVIDE() received non-numeric argument in expression: exp'));
        await expect(() => divide.evaluate({ context, args: [2, true] })).rejects.toThrowError(new ExpressionError('DIVIDE() received non-numeric argument in expression: exp'));
        await expect(() => divide.evaluate({ context, args: [2, 0] })).rejects.toThrowError(new ExpressionError('attempted to divide by zero in exp'));
    });
});