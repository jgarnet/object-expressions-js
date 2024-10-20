import {describe, expect, it} from "@jest/globals";
import BaseExpressionParser from "../base-expression-parser";
import ExpressionContext from "../types/expression-context";

const parser = new BaseExpressionParser();

const testAssertion = (expression: string, expectedValue: string[]) => {
    const ctx: ExpressionContext<any> = { expression, object: null, tokens: [], childExpressions: new Set() };
    parser.parse(ctx);
    expect(ctx.tokens).toEqual(expectedValue);
};

describe('BaseExpressionParser tests', () => {
    it('should parse logical operators', () => {
        testAssertion('A > 10 AND B < 5', ['A > 10', 'AND', 'B < 5']);
        testAssertion('A = 1 OR B = 2', ['A = 1', 'OR', 'B = 2']);
        testAssertion('NOT A = 1', ['NOT', 'A = 1']);
    });
    it('should parse groups', () => {});
    it('should parse functions', () => {
        testAssertion('LEN(A) = 4 AND A = test', ['LEN(A) = 4', 'AND', 'A = test']);
    });
    it('should parse tokens regardless of whitespace', () => {});
    it('should preserve whitespace within quotes', () => {});
    it('should ignore keywords inside quotes', () => {});
});