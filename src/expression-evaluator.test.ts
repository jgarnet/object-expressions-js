import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionEvaluator from "./expression-evaluator";
import {describe, expect, it} from "@jest/globals";

// simplified condition evaluator
const conditionEvaluator: ConditionEvaluator = {
    evaluate: (token, object) => {
        const parts = token.split(" ");
        switch (parts[1]) {
            case '=':
                return object[parts[0]] == parts[2].replace(/\\"/g, '"');
            case '>':
                return object[parts[0]] > parts[2];
            case '<':
                return object[parts[0]] < parts[2];
            case 'IN':
                const subParts = parts[2].split(',');
                const value = object[parts[0]];
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
            '((status = Delivered AND type = Online) OR (status = Picked_Up AND type = In_Store)) AND (cost > 25)',
            { status: 'Picked_Up', type: 'In_Store', cost: 50, deliveryType: 'ship', deliveryFee: 5 },
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
        testAssertion('a = "Testing_\\"nested\\"_quotes"', { a: 'Testing_"nested"_quotes'}, true);
    });
});