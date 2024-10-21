import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionContext from "./types/expression-context";
import operators from "./operators/operators";
import Operator from "./types/operator";
import ExpressionFunction from "./types/expression-function";
import functions from "./functions/functions";
const get = require("lodash/get");

class BaseConditionEvaluator implements ConditionEvaluator {
    evaluate<T>(token: string, context: ExpressionContext<T>): boolean {
        const object = context.object;
        const _operators = (context.operators ?? operators) as Map<string, Operator>;
        const _functions = (context.functions ?? functions) as Map<string, ExpressionFunction>;
        const tokens = this.getOperandsAndOperator(token, _operators);
        const [operandA, operator, operandB] = tokens;
        let value;
        if (this.isFunction(operandA, _functions)) {
            value = this.evaluateFunction(operandA, _functions, context);
        } else {
            value = get(object, operandA.trim());
        }
        let conditionValue = operandB.trim();
        // unwrap string values if defined in condition value
        if (conditionValue[0] === '"' && conditionValue[conditionValue.length - 1] === '"') {
            conditionValue = conditionValue
                .slice(1, conditionValue.length - 1)
                .replace(/\\"/g, '"');
        }
        if (_operators.has(operator)) {
            const _operator = _operators.get(operator) as Operator;
            return _operator.evaluate(value, conditionValue, tokens, context);
        }
        return false;
    }

    private getOperandsAndOperator(token: string, operators: Map<string, Operator>): string[] {
        let operandA = '';
        let operator = '';
        let operandB = '';
        let buffer = '';
        let inString = false;
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            if (char === '"') {
                inString = !inString;
            }
            if (!inString) {
                const addOperator = (): boolean => {
                    for (const operatorStr of operators.keys()) {
                        if (this.isOperator(operatorStr, token, i)) {
                            operandA = buffer;
                            buffer = '';
                            operator = operatorStr;
                            i += operatorStr.length - 1;
                            return true;
                        }
                    }
                    return false;
                };
                if (addOperator()) {
                    continue;
                }
            }
            buffer += char;
        }
        operandB = buffer;
        return [operandA, operator, operandB];
    }

    private isOperator(operator: string, token: string, index: number): boolean {
        const char = token[index].toUpperCase();
        // if there is a non-whitespace preceding character, this is not an operator
        if (index > 0 && !/\s/.test(token[index - 1])) {
            return false;
        }
        const matches = (
            // the current character is the first character of the operator being checked
            char === operator[0] &&
            // the current operator fits in the bounds of the token
            index + operator.length - 1 < token.length &&
            // the current character *is* the start of the operator
            token.slice(index, index + operator.length).toUpperCase() === operator
        );
        return matches && (
            // no characters after
            index + operator.length + 1 < token.length ||
            // or whitespace after
            /\s/.test(token[index + operator.length + 1])
        );
    }

    private isFunction(token: string, functions: Map<string, ExpressionFunction>): boolean {
        const firstParen = token.indexOf('(');
        const lastParen = token.lastIndexOf(')');
        if (firstParen === -1 || lastParen === -1) {
            return false;
        }
        const possibleKey = token.slice(0, firstParen).trim().toUpperCase();
        return functions.has(possibleKey);
    }

    private evaluateFunction<T>(token: string, functions: Map<string, ExpressionFunction>, context: ExpressionContext<T>): any {
        const firstParen = token.indexOf('(');
        const lastParen = token.lastIndexOf(')');
        const input = token.slice(firstParen + 1, lastParen);
        const args = this.parseFunctionArgs(input);
        for (let i = 0; i < args.length; i++) {
            if (this.isFunction(args[i], functions)) {
                args[i] = this.evaluateFunction(args[i], functions, context);
            }
        }
        const funcKey = token.slice(0, firstParen).trim().toUpperCase();
        const func = functions.get(funcKey) as ExpressionFunction;
        return func.evaluate(context, ...args);
    }

    private parseFunctionArgs(token: string): string[] {
        const args = [];
        let buffer = '';
        let inString = false;
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            if (char === '"') {
                inString = !inString;
            } else if (char === ',') {
                if (!inString) {
                    args.push(buffer.trim());
                    buffer = '';
                }
            }
            buffer += char;
        }
        if (buffer.trim().length > 0) {
            args.push(buffer);
        }
        return args;
    }
}

export default BaseConditionEvaluator;