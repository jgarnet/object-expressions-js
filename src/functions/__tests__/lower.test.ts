import {describe, expect, it} from "@jest/globals";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";
import lower from "../lower";

const testError = async (arg: any, error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => lower.evaluate(createContext({}), arg)).rejects.toThrowError(error);
};

describe('lower tests', () => {
    it('should return the length of a string', async () => {
        // https://youtrack.jetbrains.com/issue/WEB-36766
        // noinspection TypeScriptValidateTypes
        expect(await lower.evaluate(createContext({}), 'Test')).toEqual('test');
        // noinspection TypeScriptValidateTypes
        expect(await lower.evaluate(createContext({}), '"Test"')).toEqual('test');
        // noinspection TypeScriptValidateTypes
        expect(await lower.evaluate(createContext({}), '"\"Test\""')).toEqual('"test"');
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