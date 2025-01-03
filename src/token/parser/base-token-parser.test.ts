import {describe, expect, it} from "@jest/globals";
import BaseTokenParser from "./base-token-parser";

describe('BaseTokenParser tests', () => {
    it('should parse comma separated tokens with support for parentheses, strings, regex, and brackets', () => {
        expect(new BaseTokenParser().parse(
            'TST(1,2,3),"test, 1234",12,((test)),$[some,field],/test=,,/,(\\),),123',
            new Set([
                { symbol: '(', closeSymbol: ')', escapable: true },
                { symbol: '[', closeSymbol: ']', escapable: true },
                { symbol: '"', escapable: true },
                { symbol: '/', escapable: true }
            ]),
            new Set([{ symbol: ',' }]))
        ).toEqual(['TST(1,2,3)', '"test, 1234"', '12', '((test))', '$[some,field]', '/test=,,/', '(\\),)', '123']);
    });
    it('should support single and double quote strings', () => {
        expect(new BaseTokenParser().parse(
            `'test',"test2",'"test3',"'test4"`,
            new Set([
                { symbol: '(', closeSymbol: ')', escapable: true },
                { symbol: '[', closeSymbol: ']', escapable: true },
                { symbol: '"', escapable: true },
                { symbol: '\'', escapable: true },
                { symbol: '/', escapable: true }
            ]),
            new Set([{ symbol: ',' }]))
        ).toEqual([`'test'`, `"test2"`, `'"test3'`, `"'test4"`]);
    });
    it('should parse tokens who act as delimiters', () => {
        expect(new BaseTokenParser().parse(
            '($a[(test and test2)] = 5) and ($a = "test AND test") and $andrew = 4',
            new Set([
                { symbol: '(', closeSymbol: ')', escapable: true, break: true },
                { symbol: '[', closeSymbol: ']', escapable: true },
                { symbol: '"', escapable: true },
                { symbol: '/', escapable: true }
            ]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }]))
        ).toEqual(['($a[(test and test2)] = 5)', 'AND', '($a = "test AND test")', 'AND', '$andrew = 4']);
    });
    it('should parse functions and groups', () => {
        expect(new BaseTokenParser().parse(
            '(FUNC($a,$b) = 2) AND FUNC($b,$c) = 4',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toEqual(['(FUNC($a,$b) = 2)', 'AND', 'FUNC($b,$c) = 4']);
    });
    it('should support multi character symbols', () => {
        expect(new BaseTokenParser().parse(
            '<<group 1, test, test2>>,<<group2>>',
            new Set([{ symbol: '<<', closeSymbol: '>>' }]),
            new Set([{ symbol: ',' }])
        )).toEqual(['<<group 1, test, test2>>', '<<group2>>']);
        expect(new BaseTokenParser().parse(
            '<start>1,2,3</start>,<start>4, 5</start>',
            new Set([{ symbol: '<start>', closeSymbol: '</start>' }]),
            new Set([{ symbol: ',' }])
        )).toEqual(['<start>1,2,3</start>', '<start>4, 5</start>']);
    });
    it('should ignore escaped symbols only if inside current symbol group', () => {
        expect(new BaseTokenParser().parse(
            '\\(test()) (\\)[\\]]) test',
            new Set([
                { symbol: '(', closeSymbol: ')', break: true, escapable: true },
                { symbol: '[', closeSymbol: ']', break: true, escapable: true  }
            ]),
            new Set()
        )).toEqual(['\\(test())', '(\\)[\\]])', 'test']);
    });
    it('should throw SyntaxError when imbalanced symbols encountered', () => {
        expect(() => new BaseTokenParser().parse(
            ')(',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: ()');
        expect(() => new BaseTokenParser().parse(
            ')',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: ()');
        expect(() => new BaseTokenParser().parse(
            '))',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: ()');
        expect(() => new BaseTokenParser().parse(
            '(',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: ()');
        expect(() => new BaseTokenParser().parse(
            '((',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: ()');
        expect(() => new BaseTokenParser().parse(
            '(()',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: ()');
        expect(() => new BaseTokenParser().parse(
            '"',
            new Set([{ symbol: '(', closeSymbol: ')', escapable: true }, { symbol: '"' }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol: "');
        expect(() => new BaseTokenParser().parse(
            '<start>',
            new Set([{ symbol: '<start>', closeSymbol: '</start>', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: <start></start>');
        expect(() => new BaseTokenParser().parse(
            '</start><start>',
            new Set([{ symbol: '<start>', closeSymbol: '</start>', escapable: true }]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).toThrow('Expression contains imbalanced symbol group: <start></start>');
        expect(() => new BaseTokenParser().parse(
            '"</start><start>"',
            new Set([
                { symbol: '<start>', closeSymbol: '</start>', escapable: true },
                { symbol: '"' }
            ]),
            new Set([{ symbol: 'AND', whitespace: true, include: true }])
        )).not.toThrow();
    });
});