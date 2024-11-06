import {describe, expect} from "@jest/globals";
import createContext from "../../create-context";
import ExpressionError from "../../expression-error";
import exists from "../exists";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await exists.evaluate(ctx, ...args)).toEqual(result);
};

const testError = async (args: any[], error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => exists.evaluate(createContext({ expression: 'exp' }), ...args)).rejects.toThrowError(error);
};

describe('exists tests', () => {
    it('should evaluate if an array contains an item matching an expression', async () => {
        await testAssertion([[1,2,3,4], '($ in 2,4)'], true);
        await testAssertion([[{ a: 2 }, { a: 4 }, { a: 6}], '($a >= 4)'], true);
        await testAssertion([['test', 'test2', 'test4'], '($ LIKE test\\d+)'], true);
        await testAssertion([[2], '($ = 2)'], true);
        await testAssertion([[], '($ = 2)'], false);
        await testAssertion([[1,3,4,5], '($ = 2)'], false);
    });
    it('should evaluate if a set contains an item matching an expression', async () => {
        await testAssertion([new Set([1,2,3,4]), '($ in 2,4)'], true);
        await testAssertion([new Set([{ a: 2 }, { a: 4 }, { a: 6}]), '($a >= 4)'], true);
        await testAssertion([new Set(['test', 'test2', 'test4']), '($ LIKE test\\d+)'], true);
        await testAssertion([new Set([2]), '($ = 2)'], true);
        await testAssertion([new Set([]), '($ = 2)'], false);
        await testAssertion([new Set([1,3,4,5]), '($ = 2)'], false);
    });
    it('should throw error when invalid number of arguments is received', async () => {
        await testError([], new ExpressionError('EXISTS() requires a value and an expression to filter by; invalid arguments received in exp'));
        await testError([[]], new ExpressionError('EXISTS() requires a value and an expression to filter by; invalid arguments received in exp'));
    });
    it('should throw error when non-collection value is received', async () => {
        await testError(['test', 'test'], new ExpressionError('EXISTS() requires the first argument to contain a collection; invalid argument received in exp'));
    });
    it('should throw error when invalid expression is received', async () => {
        await testError([[], null], new ExpressionError('EXISTS() received non-string argument in expression: exp'));
        await testError([[], 1], new ExpressionError('EXISTS() received non-string argument in expression: exp'));
        await testError([[], {}], new ExpressionError('EXISTS() received non-string argument in expression: exp'));
        await testError([[], []], new ExpressionError('EXISTS() received non-string argument in expression: exp'));
    });
    it('should throw error if expression is not wrapped in parentheses', async () => {
        await testError([[], 'expression'], new ExpressionError('EXISTS() requires expression argument to be wrapped in parentheses; invalid argument received in exp'));
    });
});