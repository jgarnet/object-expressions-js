import {describe, expect, it} from "@jest/globals";
import createContext from "../../context/create-context";
import len from "./len";
import ExpressionError from "../../errors/expression-error";

const testError = async (arg: any, error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => len.evaluate({ context: createContext({}), args: [arg] })).rejects.toThrowError(error);
};

describe('len tests', () => {
    it('should return the length of a string', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await len.evaluate({ context: createContext({}), args: ['Test'] })).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(await len.evaluate({ context: createContext({}), args: ['"Test"'] })).toEqual(4);
        // noinspection TypeScriptValidateTypes
        expect(await len.evaluate({ context: createContext({}), args: ['"\"Test\""'] })).toEqual(6);
    });
    it('should throw ExpressionError when invalid arguments are received', async () => {
        await testError([], new ExpressionError('LEN() received non-string argument in expression: undefined'));
        await testError({}, new ExpressionError('LEN() received non-string argument in expression: undefined'));
        await testError(null, new ExpressionError('LEN() received non-string argument in expression: undefined'));
        await testError(undefined, new ExpressionError('LEN() received non-string argument in expression: undefined'));
    });
});