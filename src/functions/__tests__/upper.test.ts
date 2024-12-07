import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";
import upper from "../upper";

const testError = async (arg: any, error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => upper.evaluate({ context: createContext({}), args: [arg] })).rejects.toThrowError(error);
};

describe('upper tests', () => {
    it('should return the length of a string', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await upper.evaluate({ context: createContext({}), args: ['Test'] })).toEqual('TEST');
        // noinspection TypeScriptValidateTypes
        expect(await upper.evaluate({ context: createContext({}), args: ['"Test"'] })).toEqual('TEST');
        // noinspection TypeScriptValidateTypes
        expect(await upper.evaluate({ context: createContext({}), args: ['"\"Test\""'] })).toEqual('"TEST"');
    });
    it('should throw ExpressionError when invalid arguments are received', async () => {
        await testError([], new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        await testError({}, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        await testError(null, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        await testError(undefined, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        await testError(20, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
        await testError(true, new ExpressionError('UPPER() received non-string argument in expression: undefined'));
    });
});