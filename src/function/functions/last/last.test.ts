import {expect} from "@jest/globals";
import createContext from "../../../expression/context/create-context";
import ExpressionError from "../../../errors/expression-error";
import last from "./last";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await last.evaluate({ context: ctx, args })).toEqual(result);
};

const testError = async (args: any[], error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => last.evaluate({ context: createContext({ expression: 'exp' }), args })).rejects.toThrowError(error);
};

describe('last tests', () => {
    it('should throw error if non-array argument received', async () => {
        await testError([], new ExpressionError('LAST() received non-array argument in expression: exp'));
        await testError([null], new ExpressionError('LAST() received non-array argument in expression: exp'));
        await testError([{}], new ExpressionError('LAST() received non-array argument in expression: exp'));
        await testError([1], new ExpressionError('LAST() received non-array argument in expression: exp'));
        await testError([true], new ExpressionError('LAST() received non-array argument in expression: exp'));
        await testError([new Set([1,2,3])], new ExpressionError('LAST() received non-array argument in expression: exp'));
    });
    it('should return the last item of an array', async () => {
        await testAssertion([[1,2,3]], 3);
        await testAssertion([[]], undefined);
    });
});