import {describe, expect} from "@jest/globals";
import createContext from "../../context/create-context";
import ExpressionError from "../../errors/expression-error";
import filter from "./filter";

const testAssertion = async (args: any[], result: any) => {
    const ctx = createContext({});
    expect(await filter.evaluate({ context: ctx, args })).toEqual(result);
};

const testError = async (args: any[], error: ExpressionError) => {
    // noinspection TypeScriptValidateTypes
    await expect(() => filter.evaluate({ context: createContext({ expression: 'exp' }), args })).rejects.toThrowError(error);
};

describe('filter tests', () => {
    it('should filter arrays', async () => {
        await testAssertion([[1,2,3,4], '($ in 2,4)'], [2,4]);
        await testAssertion([[{ a: 2 }, { a: 4 }, { a: 6}], '($a >= 4)'], [{ a: 4 }, { a: 6 }]);
        await testAssertion([['test', 'test2', 'test4'], '($ LIKE test\\d+)'], ['test2', 'test4']);
        await testAssertion([[2], '($ = 2)'], [2]);
        await testAssertion([[], '($ = 2)'], []);
        await testAssertion([[1,3,4,5], '($ = 2)'], []);
    });
    it('should filter sets', async () => {
        await testAssertion([new Set([1,2,3,4]), '($ in 2,4)'], [2,4]);
        await testAssertion([new Set([{ a: 2 }, { a: 4 }, { a: 6}]), '($a >= 4)'], [{ a: 4 }, { a: 6 }]);
        await testAssertion([new Set(['test', 'test2', 'test4']), '($ LIKE test\\d+)'], ['test2', 'test4']);
        await testAssertion([new Set([2]), '($ = 2)'], [2]);
        await testAssertion([new Set([]), '($ = 2)'], []);
        await testAssertion([new Set([1,3,4,5]), '($ = 2)'], []);
    });
    it('should throw error when invalid number of arguments is received', async () => {
        await testError([], new ExpressionError('FILTER() requires a value and an expression to filter by; invalid arguments received in exp'));
        await testError([[]], new ExpressionError('FILTER() requires a value and an expression to filter by; invalid arguments received in exp'));
    });
    it('should throw error when non-collection value is received', async () => {
        await testError(['test', 'test'], new ExpressionError('FILTER() requires the first argument to contain a collection; invalid argument received in exp'));
    });
    it('should throw error when invalid expression is received', async () => {
        await testError([[], null], new ExpressionError('FILTER() received non-string argument in expression: exp'));
        await testError([[], 1], new ExpressionError('FILTER() received non-string argument in expression: exp'));
        await testError([[], {}], new ExpressionError('FILTER() received non-string argument in expression: exp'));
        await testError([[], []], new ExpressionError('FILTER() received non-string argument in expression: exp'));
    });
    it('should throw error if expression is not wrapped in parentheses', async () => {
        await testError([[], 'expression'], new ExpressionError('FILTER() requires expression argument to be wrapped in parentheses; invalid argument received in exp'));
    });
});