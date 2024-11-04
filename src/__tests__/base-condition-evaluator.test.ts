import {describe, expect, it} from "@jest/globals";
import BaseConditionEvaluator from "../base-condition-evaluator";
import ExpressionContext from "../types/expression-context";
import operators from "../operators/_operators";
import functions from "../functions/_functions";
import createContext from "../create-context";
import SyntaxError from "../syntax-error";

const evaluator = new BaseConditionEvaluator();

const testAssertion = async (token: string, object: any, result: boolean) => {
    // https://youtrack.jetbrains.com/issue/WEB-36766
    // noinspection TypeScriptValidateTypes
    const ctx: ExpressionContext<any> = createContext({
        expression: '',
        object,
        operators,
        functions: functions
    });
    expect(await evaluator.evaluate(token, ctx)).toEqual(result);
};

const testError = async (token: string, object: any, expectedError: Error) => {
    // noinspection TypeScriptValidateTypes
    const ctx: ExpressionContext<any> = createContext({
        expression: '',
        object,
        operators,
        functions: functions
    });
    await expect(() => evaluator.evaluate(token, ctx)).rejects.toThrowError(expectedError);
};

describe('BaseConditionEvaluator tests',  () => {
    it('should evaluate equality', async () => {
        // numbers
        await testAssertion('$field = 1', { field: 1 }, true);
        await testAssertion('$field = 2', { field: 1 }, false);
        // strings
        await testAssertion('$field = value', { field: "value" }, true);
        await testAssertion('$field = "value"', { field: "value" }, true);
        await testAssertion('$field = "value 2"', { field: "value 2" }, true);
        await testAssertion('$field = "value \\"2\\""', { field: "value \"2\"" }, true);
        await testAssertion('$field = value', { field: "value 2" }, false);
        await testAssertion('$field = "value"', { field: "value 2" }, false);
        await testAssertion('$field = "value 2"', { field: "value 3" }, false);
        await testAssertion('$field = "value \\"2\\""', { field: "value \"3\"" }, false);
    });
    it('should evaluate FILTER', async () => {
        await testAssertion('SIZE(FILTER($, ($ = 1))) = 1', [1,2,3], true);
    });
    it('should evaluate IS', async () => {
        // boolean
        await testAssertion('$field IS TRUE', { field: true }, true);
        await testAssertion('$field IS FALSE', { field: true }, false);
        await testAssertion('$field is true', { field: true }, true);
        await testAssertion('$field is false', { field: true }, false);
        await testAssertion('$field is FALSE', { field: false }, true);
        await testAssertion('$field IS false', { field: false }, true);
        await testAssertion('$field IS true', { field: false }, false);
    });
    it('should evaluate IN', async () => {
        await testAssertion('$field IN "value with spaces",test', { field: 'value with spaces' }, true);
        await testAssertion('$field IN "value with spaces"', { field: 'value with spaces' }, true);
        await testAssertion('$field IN test', { field: 'value with spaces' }, false);
        await testAssertion('$field IN test', { field: 'value with spaces' }, false);
        await testAssertion('$a in $b', { a: 'test field', b: ['value', 'test field'] }, true);
        await testAssertion('"test field" in $b', { a: 'test field', b: ['value', 'test field'] }, true);
        await testAssertion('value in $b', { a: 'test field', b: ['value', 'test field'] }, true);
        await testAssertion('test in $b', { a: 'test field', b: ['value', 'test field'] }, false);
    });
    it('should evaluate HAS', async () => {
        await testAssertion('$ HAS field', { field: 1 }, true);
    });
    it('should evaluate SIZE', async () => {
        await testAssertion('SIZE($) = 1', [1], true);
        await testAssertion('SIZE($items) = 2', { items: [1,2] }, true);
    });
    it('should evaluate POW', async () => {
        await testAssertion('POW($a,$b) = $c', {a: 10, b: 2, c: 100}, true);
        await testAssertion('POW($a,2) = $c', {a: 10, b: 2, c: 100}, true);
        await testAssertion('POW(10,2) = $c', {a: 10, b: 2, c: 100}, true);
    });
    it('should evaluate functions', async () => {
        await testAssertion('LEN($field) = 4', { field: 'test' }, true);
        await testAssertion('LEN($field  ) = 4', { field: 'test' }, true);
        await testAssertion('LEN(  $field  ) = 4', { field: 'test' }, true);
        await testAssertion('LEN(  $field) = 4', { field: 'test' }, true);
        await testAssertion('LEN($field) = LEN($fieldB)', { field: 'a', fieldB: 'b' }, true);
        await testAssertion('ADD(2,$a,$b) = 12', { a: 4, b: 6 }, true);
        await testAssertion('ADD(LEN($field), 4) = 8', { field: 'test' }, true);
        await testAssertion('LEN($a) = LEN($b)', { a: 'test', b: '1234' }, true);
        await testAssertion("LEN($>) > 5", { '>': 'test string'}, true);
        await testAssertion("LEN($[ IS ]) > 5", { ' IS ': 'test string'}, true);
    });
    it('should throw errors for invalid function syntax', async () => {
        await testError('LEN($field,  ) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        await testError('LEN($field,) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        await testError('LEN($field,,5) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        await testError('LEN(,$field) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        await testError('LEN(  ,$field) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
    });
    it('should evaluate symbols regardless of whitespace', async () => {
        await testAssertion('$field=5', { field: 5 }, true);
    });
    it('should throw errors for invalid operators / conditions', async () => {
        await testError('$A ~ 1', {}, new SyntaxError('received invalid condition $A ~ 1'));
        await testError('$A == 1', {}, new SyntaxError('received invalid condition $A == 1'));
        await testError('$A==1', {}, new SyntaxError('received invalid condition $A==1'));
        await testError('$A CONTAINS 1', {}, new SyntaxError('received invalid condition $A CONTAINS 1'));
    });
    it('should not evaluate functions inside strings', async () => {
        await testAssertion('$field = "LEN($field)"', { field: 'LEN($field)' }, true);
        await testAssertion('LEN("LEN($FIELD)") = 11', { field: 'test' }, true);
        await testAssertion('LEN(/LEN($FIELD)/) = 13', { field: 'test' }, true);
        await testAssertion('LEN("TEST,") = 5', {}, true);
        await testAssertion('LEN(/TEST,/) = 7', {}, true);
    });
    it('should not evaluate functions inside regex', async () => {
        await testAssertion('$field = /LEN($field)/', { field: '/LEN($field)/' }, true);
    });
});