import {describe, expect, it} from "@jest/globals";
import BaseExpressionParser from "../base-expression-parser";
import ExpressionContext from "../types/expression-context";
import operators from "../operators/_operators";
import functions from "../functions/_functions";
import createContext from "../create-context";
import ExpressionNode from "../types/expression-node";
import SyntaxError from "../syntax-error";

const parser = new BaseExpressionParser();

const testError = (expression: string, expectedError: Error) => {
    // https://youtrack.jetbrains.com/issue/WEB-36766
    // noinspection TypeScriptValidateTypes
    const ctx: ExpressionContext<any> = createContext({
        expression,
        object: null,
        operators: operators,
        functions: functions
    });
    expect(() => parser.parse(ctx)).toThrowError(expectedError);
};

const testAssertion = (expression: string, expectedValue: ExpressionNode) => {
    // https://youtrack.jetbrains.com/issue/WEB-36766
    // noinspection TypeScriptValidateTypes
    const ctx: ExpressionContext<any> = createContext({
        expression,
        object: null,
        operators: operators,
        functions: functions
    });
    const node = parser.parse(ctx);
    expect(node).toMatchObject(expectedValue);
};

describe('BaseExpressionParser tests', () => {
    it('should parse logical operators', () => {
        testAssertion('$A > 10 AND $B < 5', {
            token: '$A > 10',
            next: {
                node: {
                    token: '$B < 5'
                },
                relationship: 'AND'
            }
        });
        testAssertion('$A = 1 OR $B = 2', {
            token: '$A = 1',
            next: {
                node: {
                    token: '$B = 2'
                },
                relationship: 'OR'
            }
        });
        testAssertion('NOT $A = 1', {
            token: '$A = 1',
            negate: true
        });
        testAssertion('$organWeight = 5 and $organName = Heart', {
            token: '$organWeight = 5',
            next: {
                node: {
                    token: '$organName = Heart'
                },
                relationship: 'AND'
            }
        });
    });
    it('should parse groups', () => {
        testAssertion('$A = 1 AND ($B = 2 AND ($C = 3 OR $D = 1)) OR (($B = 1))', {
            token: '$A = 1',
            next: {
                node: {
                    token: '($B = 2 AND ($C = 3 OR $D = 1))',
                    next: {
                        node: {
                            token: '(($B = 1))'
                        },
                        relationship: 'OR'
                    }
                },
                relationship: 'AND'
            }
        })
    });
    it('should parse functions', () => {
        testAssertion('LEN($A) = 4 AND $A = test', {
            token: 'LEN($A) = 4',
            next: {
                node: {
                    token: '$A = test'
                },
                relationship: 'AND'
            }
        });
        testAssertion('LEN(LEN($A)) = 4 AND $A = test', {
            token: 'LEN(LEN($A)) = 4',
            next: {
                node: {
                    token: '$A = test'
                },
                relationship: 'AND'
            }
        });
        testAssertion('LEN($A, LEN($B)) = 4 AND $A = test', {
            token: 'LEN($A, LEN($B)) = 4',
            next: {
                node: {
                    token: '$A = test'
                },
                relationship: 'AND'
            }
        });
        testAssertion('$a = MULTIPLY($b, 2)', {
            token: '$a = MULTIPLY($b, 2)'
        });
        testAssertion('MULTIPLY($b, 2) = $a', {
            token: 'MULTIPLY($b, 2) = $a'
        });
        testAssertion('MULTIPLY($b, 2) = $a AND DIVIDE($c,2) = $d', {
            token: 'MULTIPLY($b, 2) = $a',
            next: {
                node: {
                    token: 'DIVIDE($c,2) = $d'
                },
                relationship: 'AND'
            }
        });
        testAssertion('(MULTIPLY($b, 2) = $a) AND (DIVIDE($c,2) = $d)', {
            token: '(MULTIPLY($b, 2) = $a)',
            next: {
                node: {
                    token: '(DIVIDE($c,2) = $d)'
                },
                relationship: 'AND'
            }
        });
        testAssertion('EVAL("EVAL($a)",$b)', {
            token: 'EVAL("EVAL($a)",$b)'
        });
        testAssertion('EVAL(/EVAL($a)/,$b)', {
            token: 'EVAL(/EVAL($a)/,$b)'
        });
    });
    it('should parse tokens regardless of whitespace', () => {
        testAssertion(`$A    =     1 AND $B
= 5`, {
            token: '$A    =     1',
            next: {
                node: {
                    token: '$B\n= 5'
                },
                relationship: 'AND'
            }
        });
        testAssertion('$A>2 AND $B=5', {
            token: '$A>2',
            next: {
                node: {
                    token: '$B=5'
                },
                relationship: 'AND'
            }
        });
    });
    it('should preserve whitespace within quotes', () => {
        testAssertion('$A = "    test   " AND     $B =     5', {
            token: '$A = "    test   "',
            next: {
                node: {
                    token: '$B =     5'
                },
                relationship: 'AND'
            }
        });
    });
    it('should ignore keywords inside quotes', () => {
        testAssertion('$field = "\\"AND 1 = 1" AND $fieldB = 2', {
            token: '$field = "\\"AND 1 = 1"',
            next: {
                node: {
                    token: '$fieldB = 2'
                },
                relationship: 'AND'
            }
        });
        testAssertion('$url = "/products/long-sleeve-shirt"', {
            token: '$url = "/products/long-sleeve-shirt"'
        });
    });
    it('should ignore parentheses inside strings', () => {
        testAssertion('$field = "(test"', { token: '$field = "(test"' });
        testAssertion('$field = "test)"', { token: '$field = "test)"' });
        testAssertion('$field = "(test)"', { token: '$field = "(test)"' });
        testAssertion('$field = "(test) AND $field > 5"', { token: '$field = "(test) AND $field > 5"' });
    });
    it('should parse regular expressions', () => {
        testAssertion('$status LIKE /^[a-zA-Z\\(\\)]$/', { token: '$status LIKE /^[a-zA-Z\\(\\)]$/' });
        testAssertion('$status LIKE /[a-zA-Z"]/', { token: '$status LIKE /[a-zA-Z"]/' });
        testAssertion('$status LIKE /[a-zA-Z] AND [0-9]/', { token: '$status LIKE /[a-zA-Z] AND [0-9]/' });
        testAssertion('$status LIKE /(SUCCESS|ERROR)/', { token: '$status LIKE /(SUCCESS|ERROR)/' });
        testAssertion('$status LIKE /ADD()/', { token: '$status LIKE /ADD()/' });
        testAssertion('$status LIKE /[a-zA-Z\\/]/', { token: '$status LIKE /[a-zA-Z\\/]/' });
    });
    it('should throw SyntaxError when invalid syntax is encountered', () => {
        testError('(invalid', new SyntaxError('expression contains an unclosed group'));
        testError(')(', new SyntaxError('expression contains an unclosed group'));
        testError('(invalid))', new SyntaxError('expression contains an unclosed group'));
        testError('LEN(invalid', new SyntaxError('expression contains an unclosed function'));
        testError('LEN(LEN(invalid)', new SyntaxError('expression contains an unclosed function'));
        testError('$a = "invalid', new SyntaxError('expression contains an unclosed string'));
        testError('$a = "invalid""', new SyntaxError('expression contains an unclosed string'));
        testError('$a = MULTIPLY(()', new SyntaxError('received invalid function call in $a = MULTIPLY(()'));
        testError('$a = MULTIPLY(())', new SyntaxError('received invalid function call in $a = MULTIPLY(())'));
        testError('$status LIKE /test//', new SyntaxError('expression contains an unclosed regular expression'));
        testError('$status LIKE /test', new SyntaxError('expression contains an unclosed regular expression'));
        testError('$status LIKE test/', new SyntaxError('expression contains an unclosed regular expression'));
        testError('$[a = 2', new SyntaxError(`expression contains an unclosed field reference: $[a = 2`));
        testError('] = 2', new SyntaxError(`expression contains an unclosed field reference: ] = 2`));
        testError('$] = 2', new SyntaxError(`expression contains an unclosed field reference: $] = 2`));
        testError('$][ = 2', new SyntaxError(`expression contains an unclosed field reference: $][ = 2`));
    });
});