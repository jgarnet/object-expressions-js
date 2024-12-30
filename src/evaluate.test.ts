import {describe, expect, it} from "@jest/globals";
import evaluate from "./evaluate";
import ExpressionError from "./errors/expression-error";
import ExpressionContext from "./expression/context/expression-context";

describe('evaluate tests', () => {
    it('should evaluate expressions', async () => {
        expect(await evaluate({ expression: '$a = 1', object: { a: 1 } })).toEqual(true);
        expect(await evaluate({ expression: '$a = 2', object: { a: 1 } })).toEqual(false);
    });
    it('should wrap runtime errors in ExpressionError', async () => {
        const expected = new ExpressionError('Encountered runtime error when evaluating expression: exp');
        expected.cause = new Error('runtime error');
        await expect(() => evaluate({
            expression: 'exp',
            object: {},
            expressionEvaluator: {
                evaluate<T>(initialContext: Partial<ExpressionContext<T>>): Promise<boolean> {
                    throw new Error('runtime error');
                }
            }
        })).rejects.toThrowError(expected);
    });
});