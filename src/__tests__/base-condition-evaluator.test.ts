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

describe('BaseConditionEvaluator tests', () => {
    it('should evaluate equality', () => {
        // numbers
        testAssertion('$field = 1', { field: 1 }, true);
        testAssertion('$field = 2', { field: 1 }, false);
        // strings
        testAssertion('$field = value', { field: "value" }, true);
        testAssertion('$field = "value"', { field: "value" }, true);
        testAssertion('$field = "value 2"', { field: "value 2" }, true);
        testAssertion('$field = "value \\"2\\""', { field: "value \"2\"" }, true);
        testAssertion('$field = value', { field: "value 2" }, false);
        testAssertion('$field = "value"', { field: "value 2" }, false);
        testAssertion('$field = "value 2"', { field: "value 3" }, false);
        testAssertion('$field = "value \\"2\\""', { field: "value \"3\"" }, false);
    });
    it('should evaluate IS', () => {
        // boolean
        testAssertion('$field IS TRUE', { field: true }, true);
        testAssertion('$field IS FALSE', { field: true }, false);
        testAssertion('$field is true', { field: true }, true);
        testAssertion('$field is false', { field: true }, false);
        testAssertion('$field is FALSE', { field: false }, true);
        testAssertion('$field IS false', { field: false }, true);
        testAssertion('$field IS true', { field: false }, false);
    });
    it('should evaluate IN', () => {
        testAssertion('$field IN "value with spaces",test', { field: 'value with spaces' }, true);
        testAssertion('$field IN "value with spaces"', { field: 'value with spaces' }, true);
        testAssertion('$field IN test', { field: 'value with spaces' }, false);
        testAssertion('$field IN test', { field: 'value with spaces' }, false);
        testAssertion('$a in $b', { a: 'test field', b: ['value', 'test field'] }, true);
        testAssertion('"test field" in $b', { a: 'test field', b: ['value', 'test field'] }, true);
        testAssertion('value in $b', { a: 'test field', b: ['value', 'test field'] }, true);
        testAssertion('test in $b', { a: 'test field', b: ['value', 'test field'] }, false);
    });
    it('should evaluate HAS', () => {
        testAssertion('$ HAS field', { field: 1 }, true);
    });
    it('should evaluate SIZE', () => {
        testAssertion('SIZE($) = 1', [1], true);
        testAssertion('SIZE($items) = 2', { items: [1,2] }, true);
    });
    it('should evaluate POW', () => {
        testAssertion('POW($a,$b) = $c', {a: 10, b: 2, c: 100}, true);
        testAssertion('POW($a,2) = $c', {a: 10, b: 2, c: 100}, true);
        testAssertion('POW(10,2) = $c', {a: 10, b: 2, c: 100}, true);
    });
    it('should evaluate functions', () => {
        testAssertion('LEN($field) = 4', { field: 'test' }, true);
        testAssertion('LEN($field  ) = 4', { field: 'test' }, true);
        testAssertion('LEN(  $field  ) = 4', { field: 'test' }, true);
        testAssertion('LEN(  $field) = 4', { field: 'test' }, true);
        testAssertion('LEN($field) = LEN($fieldB)', { field: 'a', fieldB: 'b' }, true);
        testAssertion('ADD(2,$a,$b) = 12', { a: 4, b: 6 }, true);
        testAssertion('ADD(LEN($field), 4) = 8', { field: 'test' }, true);
        testAssertion('LEN($a) = LEN($b)', { a: 'test', b: '1234' }, true);
        testAssertion("LEN($>) > 5", { '>': 'test string'}, true);
        testAssertion("LEN($[ IS ]) > 5", { ' IS ': 'test string'}, true);
    });
    it('should throw errors for invalid function syntax', () => {
        testError('LEN($field,  ) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        testError('LEN($field,) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        testError('LEN($field,,5) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        testError('LEN(,$field) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
        testError('LEN(  ,$field) = 4', {}, new SyntaxError('invalid function argument passed to LEN'));
    });
    it('should evaluate symbols regardless of whitespace', () => {
        testAssertion('$field=5', { field: 5 }, true);
    });
    it('should throw errors for invalid operators / conditions', () => {
        testError('$A ~ 1', {}, new SyntaxError('received invalid condition $A ~ 1'));
        testError('$A == 1', {}, new SyntaxError('received invalid condition $A == 1'));
        testError('$A==1', {}, new SyntaxError('received invalid condition $A==1'));
        testError('$A CONTAINS 1', {}, new SyntaxError('received invalid condition $A CONTAINS 1'));
    });
    it('should not evaluate functions inside strings', () => {
        testAssertion('$field = "LEN($field)"', { field: 'LEN($field)' }, true);
        testAssertion('LEN("LEN($FIELD)") = 11', { field: 'test' }, true);
        testAssertion('LEN(/LEN($FIELD)/) = 13', { field: 'test' }, true);
        testAssertion('LEN("TEST,") = 5', {}, true);
        testAssertion('LEN(/TEST,/) = 7', {}, true);
    });
    it('should not evaluate functions inside regex', () => {
        testAssertion('$field = /LEN($field)/', { field: '/LEN($field)/' }, true);
    });
});