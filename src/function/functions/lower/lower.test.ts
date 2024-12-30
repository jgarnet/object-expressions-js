import {describe, expect, it} from "@jest/globals";
import createContext from "../../../expression/context/create-context";
import ExpressionError from "../../../errors/expression-error";
import lower from "./lower";

const testError = async (arg: any, error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => lower.evaluate({ context: createContext({}), args: [arg] })).rejects.toThrowError(error);
};

describe('lower tests', () => {
    it('should return the length of a string', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await lower.evaluate({ context: createContext({}), args: ['Test'] })).toEqual('test');
        // noinspection TypeScriptValidateTypes
        expect(await lower.evaluate({ context: createContext({}), args: ['"Test"'] })).toEqual('test');
        // noinspection TypeScriptValidateTypes
        expect(await lower.evaluate({ context: createContext({}), args: ['"\"Test\""'] })).toEqual('"test"');
    });
    it('should throw ExpressionError when invalid arguments are received', async () => {
        await testError([], new ExpressionError('LOWER() received non-string argument in expression: undefined'));
        await testError({}, new ExpressionError('LOWER() received non-string argument in expression: undefined'));
        await testError(null, new ExpressionError('LOWER() received non-string argument in expression: undefined'));
        await testError(undefined, new ExpressionError('LOWER() received non-string argument in expression: undefined'));
        await testError(20, new ExpressionError('LOWER() received non-string argument in expression: undefined'));
        await testError(true, new ExpressionError('LOWER() received non-string argument in expression: undefined'));
    });
});