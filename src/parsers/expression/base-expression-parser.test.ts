import {describe, expect, it} from "@jest/globals";
import BaseExpressionParser from "./base-expression-parser";
import ExpressionContext from "../../context/expression-context";
import operators from "../../operators/operators";
import functions from "../../functions/functions";
import createContext from "../../context/create-context";
import ExpressionNode from "../../evaluators/expression/expression-node";
import SyntaxError from "../../errors/syntax-error";

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
    it('should parse logical operators', async () => {
        await testAssertion('$A > 10 AND $B < 5', {
            token: '$A > 10',
            next: {
                node: {
                    token: '$B < 5'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('$A = 1 OR $B = 2', {
            token: '$A = 1',
            next: {
                node: {
                    token: '$B = 2'
                },
                relationship: 'OR'
            }
        });
        await testAssertion('NOT $A = 1', {
            token: '$A = 1',
            negate: true
        });
        await testAssertion('$organWeight = 5 and $organName = Heart', {
            token: '$organWeight = 5',
            next: {
                node: {
                    token: '$organName = Heart'
                },
                relationship: 'AND'
            }
        });
    });
    it('should parse groups', async () => {
        await testAssertion('$A = 1 AND ($B = 2 AND ($C = 3 OR $D = 1)) OR (($B = 1))', {
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
    it('should parse functions', async () => {
        await testAssertion('LEN($A) = 4 AND $A = test', {
            token: 'LEN($A) = 4',
            next: {
                node: {
                    token: '$A = test'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('LEN(LEN($A)) = 4 AND $A = test', {
            token: 'LEN(LEN($A)) = 4',
            next: {
                node: {
                    token: '$A = test'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('LEN($A, LEN($B)) = 4 AND $A = test', {
            token: 'LEN($A, LEN($B)) = 4',
            next: {
                node: {
                    token: '$A = test'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('$a = MULTIPLY($b, 2)', {
            token: '$a = MULTIPLY($b, 2)'
        });
        await testAssertion('MULTIPLY($b, 2) = $a', {
            token: 'MULTIPLY($b, 2) = $a'
        });
        await testAssertion('MULTIPLY($b, 2) = $a AND DIVIDE($c,2) = $d', {
            token: 'MULTIPLY($b, 2) = $a',
            next: {
                node: {
                    token: 'DIVIDE($c,2) = $d'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('(MULTIPLY($b, 2) = $a) AND (DIVIDE($c,2) = $d)', {
            token: '(MULTIPLY($b, 2) = $a)',
            next: {
                node: {
                    token: '(DIVIDE($c,2) = $d)'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('LEN("EVAL($a)",$b)', {
            token: 'LEN("EVAL($a)",$b)'
        });
        await testAssertion('LEN(/EVAL($a)/,$b)', {
            token: 'LEN(/EVAL($a)/,$b)'
        });
    });
    it('should parse tokens regardless of whitespace', async () => {
        await testAssertion(`$A    =     1 AND $B
= 5`, {
            token: '$A    =     1',
            next: {
                node: {
                    token: '$B\n= 5'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('$A>2 AND $B=5', {
            token: '$A>2',
            next: {
                node: {
                    token: '$B=5'
                },
                relationship: 'AND'
            }
        });
    });
    it('should preserve whitespace within quotes', async () => {
        await testAssertion('$A = "    test   " AND     $B =     5', {
            token: '$A = "    test   "',
            next: {
                node: {
                    token: '$B =     5'
                },
                relationship: 'AND'
            }
        });
    });
    it('should ignore keywords inside quotes', async () => {
        await testAssertion('$field = "\\"AND 1 = 1" AND $fieldB = 2', {
            token: '$field = "\\"AND 1 = 1"',
            next: {
                node: {
                    token: '$fieldB = 2'
                },
                relationship: 'AND'
            }
        });
        await testAssertion('$url = "/products/long-sleeve-shirt"', {
            token: '$url = "/products/long-sleeve-shirt"'
        });
    });
    it('should ignore parentheses inside strings', async () => {
        await testAssertion('$field = "(test"', { token: '$field = "(test"' });
        await testAssertion('$field = "test)"', { token: '$field = "test)"' });
        await testAssertion('$field = "(test)"', { token: '$field = "(test)"' });
        await testAssertion('$field = "(test) AND $field > 5"', { token: '$field = "(test) AND $field > 5"' });
    });
    it('should parse regular expressions', async () => {
        await testAssertion('$status LIKE /^[a-zA-Z\\(\\)]$/', { token: '$status LIKE /^[a-zA-Z\\(\\)]$/' });
        await testAssertion('$status LIKE /[a-zA-Z"]/', { token: '$status LIKE /[a-zA-Z"]/' });
        await testAssertion('$status LIKE /[a-zA-Z] AND [0-9]/', { token: '$status LIKE /[a-zA-Z] AND [0-9]/' });
        await testAssertion('$status LIKE /(SUCCESS|ERROR)/', { token: '$status LIKE /(SUCCESS|ERROR)/' });
        await testAssertion('$status LIKE /ADD()/', { token: '$status LIKE /ADD()/' });
        await testAssertion('$status LIKE /[a-zA-Z\\/]/', { token: '$status LIKE /[a-zA-Z\\/]/' });
    });
    it('should throw SyntaxError when invalid syntax is encountered', async () => {
        await testError('(invalid', new SyntaxError('Expression contains imbalanced symbol group: ()'));
        await testError(')(', new SyntaxError('Expression contains imbalanced symbol group: ()'));
        await testError('(invalid))', new SyntaxError('Expression contains imbalanced symbol group: ()'));
        await testError('LEN(invalid', new SyntaxError('Expression contains imbalanced symbol group: ()'));
        await testError('LEN(LEN(invalid)', new SyntaxError('Expression contains imbalanced symbol group: ()'));
        await testError('$a = "invalid', new SyntaxError('Expression contains imbalanced symbol: "'));
        await testError('$a = "invalid""', new SyntaxError('Expression contains imbalanced symbol: "'));
        await testError('$a = MULTIPLY(()', new SyntaxError('Expression contains imbalanced symbol group: ()'));
        await testError('$status LIKE /test//', new SyntaxError('Expression contains imbalanced symbol: /'));
        await testError('$status LIKE /test', new SyntaxError('Expression contains imbalanced symbol: /'));
        await testError('$status LIKE test/', new SyntaxError('Expression contains imbalanced symbol: /'));
        await testError('$[a = 2', new SyntaxError(`Expression contains imbalanced symbol group: []`));
        await testError('] = 2', new SyntaxError(`Expression contains imbalanced symbol group: []`));
        await testError('$] = 2', new SyntaxError(`Expression contains imbalanced symbol group: []`));
        await testError('$][ = 2', new SyntaxError(`Expression contains imbalanced symbol group: []`));
    });
});