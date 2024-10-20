import {describe, expect, it} from "@jest/globals";
import BaseConditionEvaluator from "./base-condition-evaluator";

const evaluator = new BaseConditionEvaluator();

describe('BaseConditionEvaluator tests', () => {
    it('should evaluate equality', () => {
        // numbers
        expect(evaluator.evaluate('field = 1', { field: 1 })).toEqual(true);
        expect(evaluator.evaluate('field = 2', { field: 1 })).toEqual(false);
        // strings
    });
    it('should evaluate IS', () => {
        // boolean
        expect(evaluator.evaluate('field IS TRUE', { field: true })).toEqual(true);
        expect(evaluator.evaluate('field IS FALSE', { field: true })).toEqual(false);
        expect(evaluator.evaluate('field is true', { field: true })).toEqual(true);
        expect(evaluator.evaluate('field is false', { field: true })).toEqual(false);
        expect(evaluator.evaluate('field is FALSE', { field: false })).toEqual(true);
        expect(evaluator.evaluate('field IS false', { field: false })).toEqual(true);
        expect(evaluator.evaluate('field IS true', { field: false })).toEqual(false);
    });
});