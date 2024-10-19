import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionEvaluator from "./expression-evaluator";
import {describe, expect, it} from "@jest/globals";

// simplified condition evaluator
const conditionEvaluator: ConditionEvaluator = {
    evaluate: (token, object) => {
        const parts = token.split(" ");
        const field = parts[0];
        const operator = parts[1];
        let conditionValue = parts.slice(2).join(' ');
        // unwrap string values -- this would need to be managed for each ConditionEvaluator based on syntax rules
        if (conditionValue[0] === '"' && conditionValue[conditionValue.length - 1] === '"') {
            conditionValue = conditionValue.slice(1, conditionValue.length - 1);
        }
        const value = object[field];
        switch (operator) {
            case '=':
                return value == conditionValue.replace(/\\"/g, '"');
            case '>':
                return value > conditionValue;
            case '<':
                return value < conditionValue;
            case 'IN':
                const subParts = conditionValue.split(',');
                return subParts.indexOf(value) !== -1;
        }
        return false;
    }
};

const testAssertion = (expression: string, object: any, outcome: boolean) => {
    const evaluator = new ExpressionEvaluator(conditionEvaluator);
    expect(evaluator.evaluate(expression, object)).toEqual(outcome);
};

describe('ExpressionEvaluator Tests', () => {
    it('should evaluate simple expressions', () => {
        testAssertion('field = 5', { field: 5 }, true);
        testAssertion('(field = 5)', { field: 5 }, true);
        testAssertion('(((field = 5)))', { field: 5 }, true);
        testAssertion('field = 6', { field: 5 }, false);
        testAssertion('NOT field = 6', { field: 5 }, true);
    });
    it('should evaluate simple expressions with operators', () => {
        testAssertion('field = 5 AND field > 4', { field: 5 }, true);
        testAssertion('field = 5 AND field > 4', { field: 5 }, true);
        testAssertion('field = 6 OR field > 3', { field: 5 }, true);
        testAssertion('field = 6 OR field < 2', { field: 5 }, false);
        testAssertion('field = 6 OR NOT field < 2', { field: 5 }, true);
        testAssertion('field > 4 AND fieldB < 20', { field: 5, fieldB: 10 }, true);
        testAssertion('field > 4 AND fieldB IN TST,TST1,TST2', { field: 5, fieldB: 'TST' }, true);
        testAssertion('field > 4 AND fieldB IN TST,TST1,TST2', { field: 5, fieldB: 'TST' }, true);
    });
    it('should evaluate child expressions', () => {
        testAssertion(
            'firstName = John AND (lastName = Smith OR age > 20) AND (profession = IT)',
            { firstName: 'John', lastName: 'Doe', age: 23, profession: 'IT', yearsOfExperience: 2 },
            true
        );
        testAssertion(
            'firstName = John AND (lastName = Smith OR age > 20) AND profession = IT',
            { firstName: 'John', lastName: 'Doe', age: 23, profession: 'IT', yearsOfExperience: 2 },
            true
        );
        testAssertion(
            '(firstName = "John" AND (lastName = Smith OR age > 20) AND profession = IT) OR (firstName = Jane AND ((NOT profession = Finance) OR profession = Finance AND yearsOfExperience > 3))',
            { firstName: 'Jane', lastName: 'Doe', age: 25, profession: 'Finance', yearsOfExperience: 5 },
            true
        );
        testAssertion(
            '((status = Delivered AND type = Online) OR (status = Picked Up AND type = In Store)) AND cost > 25',
            { status: 'Delivered', type: 'Online', cost: 50, deliveryType: 'ship', deliveryFee: 5 },
            true
        );
        testAssertion(
            '((status = Delivered AND type = Online) OR (status = Picked Up AND type = In Store)) AND cost > 25',
            { status: 'Ordered', type: 'Online', cost: 50, deliveryType: 'ship', deliveryFee: 5 },
            false
        );
        testAssertion(
            '((status = Delivered AND type = Online) OR (status = Picked Up AND type = In Store)) AND (cost > 25)',
            { status: 'Picked Up', type: 'In Store', cost: 50, deliveryType: 'ship', deliveryFee: 5 },
            true
        );
        testAssertion(
            '(a = 1 AND b = 2) AND NOT (c > 5) AND (c < 1 OR d > 2)',
            { a: 1, b: 2, c: 3, d: 4 },
            true
        );
        testAssertion(
            '(a = 1 AND b = 2) AND NOT ((c > 5)) AND (((c < 1 OR d > 2)))',
            { a: 1, b: 2, c: 3, d: 4 },
            true
        );
    });
    it('should account for quotes and whitespace', () => {
        testAssertion(`
            a = 1
        `, { a: 1 }, true);
        testAssertion(`
            a = "testing\nmultiple\nlines"
        `, { a: 'testing\nmultiple\nlines' }, true);
        testAssertion(`
            a = testing\nmultiple\nlines
        `, { a: 'testing\nmultiple\nlines' }, false);
        testAssertion('a = "Testing \\"nested\\" quotes"', { a: 'Testing "nested" quotes'}, true);
    });
    it('should not parse tokens inside strings as operators', () => {
        testAssertion('a = "NOT test"', { a: 'NOT test' }, true);
        testAssertion('a = "a = 1 AND a > 0"', { a: 'a = 1 AND a > 0' }, true);
        testAssertion('a = "a = 1 AND a > 0" AND b = 5', { a: 'a = 1 AND a > 0', b: 5 }, true);
        testAssertion('(a = "a = 1 AND a > 0" AND (b = 5))', { a: 'a = 1 AND a > 0', b: 5 }, true);
    });
});