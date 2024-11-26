import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {comparePrimitives, getField, isCollection} from "../utils";

const isNil = require("lodash/isNil");

const _in: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
        const values = isCollection(rightSide) ? rightSide : split(rightSide, context);
        for (let val of values) {
            if (context.functionEvaluator.isFunction(val, context)) {
                val = await context.functionEvaluator.evaluate(val, context);
            }
            if (typeof (val as any) === 'string' && val.startsWith('$')) {
                val = getField(val, context);
            }
            if (isNil(leftSide) && isNil(val)) {
                return true;
            } else if (isNil(leftSide) || isNil(val)) {
                return false;
            }
            if (comparePrimitives(leftSide, val, context) === 0) {
                return true;
            }
        }
        return false;
    },
    precedence: 1
};

const split = <T> (token: string, context: ExpressionContext<T>): string[] => {
    return context.fragmentParser.parse(
        token,
        context.standardTokens,
        new Set([
            { symbol: ',' }
        ])
    );
};

export default _in;