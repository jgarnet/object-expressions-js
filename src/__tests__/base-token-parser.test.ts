import {describe, expect, it} from "@jest/globals";
import BaseTokenParser from "../base-token-parser";

describe('BaseTokenParser tests', () => {
    it('should parse comma separated tokens with support for parentheses, strings, regex, and brackets', () => {
        expect(new BaseTokenParser().parse(
            'TST(1,2,3),"test, 1234",12,((test)),$[some,field],/test=,,/,(\\),),123',
            [
                { symbol: '(', closeSymbol: ')', escapable: true },
                { symbol: '[', closeSymbol: ']', escapable: true },
                { symbol: '"', escapable: true },
                { symbol: '/', escapable: true }
            ],
            new Set([{ symbol: ',' }]))
        ).toEqual(['TST(1,2,3)', '"test, 1234"', '12', '((test))', '$[some,field]', '/test=,,/', '(\\),)', '123']);
    });
    it('should parse tokens who act as delimiters', () => {
        expect(new BaseTokenParser().parse(
            '($a[(test and test2)] = 5) and ($a = "test AND test") and $andrew = 4',
            [
                { symbol: '(', closeSymbol: ')', escapable: true, delimiter: true },
                { symbol: '[', closeSymbol: ']', escapable: true },
                { symbol: '"', escapable: true },
                { symbol: '/', escapable: true }
            ],
            new Set([{ symbol: 'AND', whitespace: true, include: true }]))
        ).toEqual(['($a[(test and test2)] = 5)', 'AND', '($a = "test AND test")', 'AND', '$andrew = 4']);
    });
});