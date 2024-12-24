import {describe, it, expect} from "@jest/globals";
import createContext from "../../context/create-context";
import get from "./get";
import ExpressionError from "../../errors/expression-error";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await get.evaluate({ context: ctx, args })).toEqual(result);
};

const testError = async (args: any[], error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => get.evaluate({ context: createContext({ expression: 'exp' }), args })).rejects.toThrowError(error);
};

describe('get tests', () => {
    it('should throw error if invalid number of arguments received', async () => {
        await testError([], new ExpressionError('GET() requires a collection and an object path; invalid arguments received in exp'));
        await testError([[]], new ExpressionError('GET() requires a collection and an object path; invalid arguments received in exp'));
    });
    it('should throw error if non-string / numeric path received', async () => {
        await testError([[], []], new ExpressionError('GET() received non-string argument in expression: exp'));
        await testError([[], {}], new ExpressionError('GET() received non-string argument in expression: exp'));
    });
    it('should return null if null or undefined collection received', async () => {
        await testAssertion([null, 'test'], null);
        await testAssertion([undefined, 'test'], null);
    });
    it('should retrieve an item from a collection given a path', async () => {
        await testAssertion([[0,1], 1], 1);
        await testAssertion([[0,1], '1'], 1);
        await testAssertion([[{ a: 1 }, { a: 2 }], '$0.a'], 1);
    });
});