import {describe, expect, it} from "@jest/globals";
import BaseExpressionParser from "../base-expression-parser";
import ExpressionContext from "../types/expression-context";
import operators from "../operators/_operators";
import functions from "../functions/_functions";

const parser = new BaseExpressionParser();

const testError = (expression: string, expectedError: Error) => {
    const ctx: ExpressionContext<any> = {
        expression,
        object: null,
        tokens: [],
        childExpressions: new Set(),
        operators: operators,
        functions: functions
    };
    expect(() => parser.parse(ctx)).toThrowError(expectedError);
};

const testAssertion = (expression: string, expectedValue: string[]) => {
    const ctx: ExpressionContext<any> = {
        expression,
        object: null,
        tokens: [],
        childExpressions: new Set(),
        operators: operators,
        functions: functions
    };
    parser.parse(ctx);
    expect(ctx.tokens).toEqual(expectedValue);
};

describe('BaseExpressionParser tests', () => {
    it('should parse logical operators', () => {
        testAssertion('A > 10 AND B < 5', ['A > 10', 'AND', 'B < 5']);
        testAssertion('A = 1 OR B = 2', ['A = 1', 'OR', 'B = 2']);
        testAssertion('NOT A = 1', ['NOT', 'A = 1']);
    });
    it('should parse groups', () => {
        testAssertion('A = 1 AND (B = 2 AND (C = 3 OR D = 1)) OR ((B = 1))', [
            'A = 1', 'AND', 'B = 2 AND (C = 3 OR D = 1)', 'OR', '(B = 1)'
        ])
    });
    it('should parse functions', () => {
        testAssertion('LEN(A) = 4 AND A = test', ['LEN(A) = 4', 'AND', 'A = test']);
        testAssertion('LEN(LEN(A)) = 4 AND A = test', ['LEN(LEN(A)) = 4', 'AND', 'A = test']);
        testAssertion('LEN(A, LEN(B)) = 4 AND A = test', ['LEN(A, LEN(B)) = 4', 'AND', 'A = test']);
    });
    it('should parse tokens regardless of whitespace', () => {
        testAssertion(`A    =     1 AND B
        = 5`, ['A = 1', 'AND', 'B = 5']);
        testAssertion('A>2 AND B=5', ['A>2', 'AND', 'B=5']);
    });
    it('should preserve whitespace within quotes', () => {
        testAssertion('A = "    test   " AND     B =     5', ['A = "    test   "', 'AND', 'B = 5']);
    });
    it('should ignore keywords inside quotes', () => {
        testAssertion('field = "\\"AND 1 = 1" AND fieldB = 2', ['field = "\\"AND 1 = 1"', 'AND', 'fieldB = 2']);
    });
    it('should throw SyntaxError when invalid syntax is encountered', () => {
        testError('(invalid', new Error('SyntaxError: expression contains an unclosed group'));
        testError('(invalid))', new Error('SyntaxError: expression contains an unclosed group'));
        testError('LEN(invalid', new Error('SyntaxError: expression contains an unclosed function'));
        testError('LEN(LEN(invalid)', new Error('SyntaxError: expression contains an unclosed function'));
        testError('a = "invalid', new Error('SyntaxError: expression contains an unclosed string'));
        testError('a = "invalid""', new Error('SyntaxError: expression contains an unclosed string'));
    });
});