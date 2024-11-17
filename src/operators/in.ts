import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {comparePrimitives, getField, isCollection} from "../_utils";

const isNil = require("lodash/isNil");

const _in: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
        const values = isCollection(rightSide) ? rightSide : split(rightSide);
        for (let val of values) {
            if (context.functionEvaluator.isFunction(val, context)) {
                const result = await context.functionEvaluator.evaluate(val, context);
                if (isNil(leftSide) && isNil(result)) {
                    return true;
                } else if (isNil(leftSide) || isNil(result)) {
                    return false;
                }
                if (comparePrimitives(leftSide, result, context) === 0) {
                    return true;
                }
            } else {
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
        }
        return false;
    },
    precedence: 1
};

const split = (token: string): string[] => {
    let parenCount = 0;
    let bracketCount = 0;
    let inRegex = false;
    let inString = false;
    let buffer = '';
    const values = [];
    for (let i = 0; i < token.length; i++) {
        const c = token[i];
        switch (c) {
            case '(':
                buffer += c;
                if (bracketCount === 0 && !inRegex && !inString) {
                    parenCount++;
                }
                break;
            case ')':
                buffer += c;
                if (parenCount > 0) {
                    parenCount--;
                }
                break;
            case '[':
                buffer += c;
                if (parenCount === 0 && !inRegex && !inString) {
                    bracketCount++;
                }
                break;
            case ']':
                buffer += c;
                if (bracketCount > 0) {
                    bracketCount--;
                }
                break;
            case '/':
                buffer += c;
                if (!inRegex) {
                    inRegex = true;
                } else if (token[i - 1] !== '\\') {
                    inRegex = false;
                }
                break;
            case '"':
                buffer += c;
                if (!inString) {
                    inString = true;
                } else if (token[i - 1] !== '\\') {
                    inString = false;
                }
                break;
            case ',':
                if (inString || inRegex || bracketCount > 0 || parenCount > 0) {
                    buffer += c;
                } else {
                    values.push(buffer.trim());
                    buffer = '';
                }
                break;
            default:
                buffer += c;
        }
    }
    if (buffer.trim().length > 0) {
        values.push(buffer);
    }
    return values;
};

export default _in;