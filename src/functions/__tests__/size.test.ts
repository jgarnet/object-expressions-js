import {expect} from "@jest/globals";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";
import size from "../size";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await size.evaluate({ context: ctx, args })).toEqual(result);
};

const testError = async (args: any[], error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => size.evaluate({ context: createContext({ expression: 'exp' }), args })).rejects.toThrowError(error);
};

describe('size tests', () => {
    it('should throw error when invalid argument received', async () => {
        await testError([], new ExpressionError('SIZE() received non-collection argument in expression: exp'));
        await testError([1], new ExpressionError('SIZE() received non-collection argument in expression: exp'));
        await testError([true], new ExpressionError('SIZE() received non-collection argument in expression: exp'));
        await testError([{}], new ExpressionError('SIZE() received non-collection argument in expression: exp'));
    });
    it('should return the size of a collection', async () => {
        await testAssertion([[1,2,3]], 3);
        await testAssertion([new Set([1,2,3])], 3);
    });
});