import BaseExpressionEvaluator from "../base-expression-evaluator";
import {describe, expect, it} from "@jest/globals";
import SyntaxError from "../syntax-error";

const testAssertion = async (expression: string, object: any, outcome: boolean) => {
    const evaluator = new BaseExpressionEvaluator();
    expect(await evaluator.evaluate({ expression, object })).toEqual(outcome);
};

const testError = async (expression: string, expectedError: Error) => {
    const evaluator = new BaseExpressionEvaluator();
    await expect(() => evaluator.evaluate({ expression, object: { A: 2, B: 3 } })).rejects.toThrowError(expectedError);
};

describe('BaseExpressionEvaluator Tests', () => {
    it('should evaluate simple expressions', async () => {
        await testAssertion('$field = 5', { field: 5 }, true);
        await testAssertion('($field = 5)', { field: 5 }, true);
        await testAssertion('((($field = 5)))', { field: 5 }, true);
        await testAssertion('$field = 6', { field: 5 }, false);
        await testAssertion('NOT $field = 6', { field: 5 }, true);
        await testAssertion('$a = $b', { a: 1, b: 1}, true);
        await testAssertion('$a = $b', { a: 1, b: 2}, false);
    });
    it('should evaluate simple expressions with operators', async () => {
        await testAssertion('$field = 5 AND $field > 4', { field: 5 }, true);
        await testAssertion('$field = 5 AND $field > 4', { field: 5 }, true);
        await testAssertion('$field = 6 OR $field > 3', { field: 5 }, true);
        await testAssertion('$field = 6 OR $field < 2', { field: 5 }, false);
        await testAssertion('$field = 6 OR NOT $field < 2', { field: 5 }, true);
        await testAssertion('$field > 4 AND $fieldB < 20', { field: 5, fieldB: 10 }, true);
        await testAssertion('$field > 4 AND $fieldB IN TST,TST1,TST2', { field: 5, fieldB: 'TST' }, true);
        await testAssertion('$field > 4 AND $fieldB IN TST,TST1,TST2', { field: 5, fieldB: 'TST' }, true);
        await testAssertion('$a = 1 OR $a = 2 OR $a = 3', { a: 3 }, true);
        await testAssertion('$a = 1 AND $b = 1 OR $b = 2', { a: 1, b: 2 }, true);
    });
    it('should evaluate child expressions', async () => {
        await testAssertion(
            '$firstName = John AND ($lastName = Smith OR $age > 20) AND ($profession = IT)',
            { firstName: 'John', lastName: 'Doe', age: 23, profession: 'IT', yearsOfExperience: 2 },
            true
        );
        await testAssertion(
            '$firstName = John AND ($lastName = Smith OR $age > 20) AND $profession = IT',
            { firstName: 'John', lastName: 'Doe', age: 23, profession: 'IT', yearsOfExperience: 2 },
            true
        );
        await testAssertion(
            '($firstName = "John" AND ($lastName = Smith OR $age > 20) AND $profession = IT) OR ($firstName = Jane AND ((NOT $profession = Finance) OR $profession = Finance AND $yearsOfExperience > 3))',
            { firstName: 'Jane', lastName: 'Doe', age: 25, profession: 'Finance', yearsOfExperience: 5 },
            true
        );
        await testAssertion(
            '(($status = Delivered AND $type = Online) OR ($status = "Picked Up" AND $type = "In Store")) AND $cost > 25',
            { status: 'Delivered', type: 'Online', cost: 50, deliveryType: 'ship', deliveryFee: 5 },
            true
        );
        await testAssertion(
            '(($status = Delivered AND $type = Online) OR ($status = "Picked Up" AND $type = "In Store")) AND $cost > 25',
            { status: 'Ordered', type: 'Online', cost: 50, deliveryType: 'ship', deliveryFee: 5 },
            false
        );
        await testAssertion(
            '(($status = Delivered AND $type = Online) OR ($status = "Picked Up" AND $type = "In Store")) AND ($cost > 25)',
            { status: 'Picked Up', type: 'In Store', cost: 50, deliveryType: 'ship', deliveryFee: 5 },
            true
        );
        await testAssertion(
            '($a = 1 AND $b = 2) AND NOT ($c > 5) AND ($c < 1 OR $d > 2)',
            { a: 1, b: 2, c: 3, d: 4 },
            true
        );
        await testAssertion(
            '($a = 1 AND $b = 2) AND NOT (($c > 5)) AND ((($c < 1 OR $d > 2)))',
            { a: 1, b: 2, c: 3, d: 4 },
            true
        );
    });
    it('should account for quotes and whitespace', async () => {
        await testAssertion(`
            $a = 1
        `, { a: 1 }, true);
        await testAssertion(`
            $a = "testing\nmultiple\nlines"
        `, { a: 'testing\nmultiple\nlines' }, true);
        await testAssertion(`
            $a = testing\nmultiple\nlines
        `, { a: 'testing\nmultiple\nlines' }, true);
        await testAssertion('$a = "Testing \\"nested\\" quotes"', { a: 'Testing "nested" quotes'}, true);
        await testAssertion(
            `
            ($a = 1 OR $b > 2)
            AND
            ($b < 5 OR $c > 5)
            `,
            { a: 5, b: 7, c: 9 },
            true
        );
        await testAssertion(
            `
            (
            ($a = 1 OR $b > 2)
            AND
            ($b < 5 OR $c > 5) AND ($d = 11)
            )
            `,
            { a: 5, b: 7, c: 9, d: 11 },
            true
        );
        await testAssertion(
            `
            (
            ($a = 1
            OR
            $b > 2)
            AND
            ($b < 5
            OR $c > 5)
            AND ($d = 11)
            )
            `,
            { a: 5, b: 7, c: 9, d: 11 },
            true
        );
        await testAssertion(
            `
            $firstName = John AND
            $profession = "Health Care"
            AND $age = 23
            `,
            { firstName: 'John', lastName: 'Doe', age: 23, profession: 'Health Care' },
            true
        );
        await testAssertion(
            `
            $firstName = John AND
            $profession = "Health
Care"
            AND $age = 23
            `,
            { firstName: 'John', lastName: 'Doe', age: 23, profession: 'Health\nCare' },
            true
        );
        await testAssertion('$a = $[b with spaces    ]', { a: 1, 'b with spaces    ': 1 }, true);
    });
    it('should not parse tokens inside strings as operators', async () => {
        await testAssertion('$a = "NOT test"', { a: 'NOT test' }, true);
        await testAssertion('$a = "a = 1 AND a > 0"', { a: 'a = 1 AND a > 0' }, true);
        await testAssertion('$a = "a = 1 AND a > 0" AND $b = 5', { a: 'a = 1 AND a > 0', b: 5 }, true);
        await testAssertion('($a = "a = 1 AND a > 0" AND ($b = 5))', { a: 'a = 1 AND a > 0', b: 5 }, true);
    });
    it('should not parse tokens inside field references', async () => {
        await testAssertion('$[some ") field/] = 1', { 'some ") field/': 1 }, true);
        await testAssertion('$[$field = AND test] = 1', { '$field = AND test': 1 }, true);
    });
    it('should not parse parentheses inside strings', async () => {
        await testAssertion('$a = "(a = 5) OR (a = 6)"', { a: '(a = 5) OR (a = 6)' }, true);
        await testAssertion('$a = "))"', { a: '))' }, true);
        await testAssertion('$a = "(("', { a: '((' }, true);
    });
    it('should throw SyntaxError when incomplete logical operations are detected', async () => {
        await testError('$A = 1 AND OR', new SyntaxError('incomplete logical operation detected in $A = 1 AND OR'));
        await testError('($A = 1) AND OR', new SyntaxError('incomplete logical operation detected in ($A = 1) AND OR'));
        await testError('($A = 1 AND) OR', new SyntaxError('incomplete logical operation detected in ($A = 1 AND) OR'));
        await testError('$A = 1 AND AND $B = 2', new SyntaxError('incomplete logical operation detected in $A = 1 AND AND $B = 2'));
        await testError('$A = 1 OR OR $B = 2', new SyntaxError('incomplete logical operation detected in $A = 1 OR OR $B = 2'));
        await testError('$A = 2 AND $B = 3 OR OR', new SyntaxError('incomplete logical operation detected in $A = 2 AND $B = 3 OR OR'));
        await testError('NOT', new SyntaxError('incomplete logical operation detected in NOT'));
        await testError('AND', new SyntaxError('incomplete logical operation detected in AND'));
        await testError('OR', new SyntaxError('incomplete logical operation detected in OR'));
        await testError('NOT AND', new SyntaxError('incomplete logical operation detected in NOT AND'));
        await testError('AND AND', new SyntaxError('incomplete logical operation detected in AND AND'));
        await testError('OR OR', new SyntaxError('incomplete logical operation detected in OR OR'));
        await testError('OR NOT', new SyntaxError('incomplete logical operation detected in OR NOT'));
        await testError('$A = 1 NOT', new SyntaxError('incomplete logical operation detected in $A = 1 NOT'));
    });
    it('should evaluate expressions with functions', async () => {
        await testAssertion('LEN($a) = LEN($b)', { a: 'test', b: '1234' }, true);
        await testAssertion('ADD(2,2) = SUBTRACT(8,4)', {}, true);
        await testAssertion('ADD(2,ADD(1,1)) = SUBTRACT(8,ADD(2,2))', {}, true);
        await testAssertion('ADD(2,ADD(1,1)) = SUBTRACT(8,ADD(2,2)) AND ADD(2,2) = 4', {}, true);
        await testAssertion('(ADD(ADD(1,1),ADD(1,1)) = 4) AND (ADD(2,2) = 4 AND ADD(1,1,1,1) = 4)', {}, true);
        await testAssertion('$a = MULTIPLY($b, 2)', { a: 4, b: 2 }, true);
        await testAssertion('size($a) = add($b, 2)', { a: [1,2,3,4], b: 2 }, true);
    });
    it('should evaluate expressions with regular expressions', async () => {
        await testAssertion('$url LIKE /\/products\/.*/', { url: '/products/long-sleeve-shirt' }, true);
    });
    it('should evaluate expression containing IN operator with various argument types', async () => {
        await testAssertion('$a in add(1,1),"2,3,4",5', { a: 5 }, true);
        await testAssertion('$a in "1,2,3,4"', { a: 1 }, false);
        await testAssertion('$a in "1"', { a: 1 }, true);
        await testAssertion('$a in /1/,2,$[other field]', { a: 1 }, false);
        await testAssertion('$a in /1/,2,$[other field]', { a: 1, 'other field': 1 }, true);
    });
});