import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionContext from "./types/expression-context";
import ComparisonOperator from "./types/comparison-operator";
import ExpressionFunction from "./types/expression-function";
import {getField} from "./_utils";

class BaseConditionEvaluator implements ConditionEvaluator {
    evaluate<T>(token: string, context: ExpressionContext<T>): boolean {
        const tokens = this.getOperandsAndOperator(token, context.operators);
        const [operandA, operator, operandB] = tokens;
        if (operandA.trim().length === 0 || operator.trim().length === 0 || operandB.trim().length === 0) {
            throw new Error(`SyntaxError: received invalid condition ${token}`);
        }
        let value;
        if (this.isFunction(operandA, context.functions)) {
            value = this.evaluateFunction(operandA, context.functions, context);
        } else {
            value = getField(context, operandA.trim());
        }
        let conditionValue = operandB.trim();
        if (this.isFunction(conditionValue, context.functions)) {
            conditionValue = this.evaluateFunction(conditionValue, context.functions, context);
        }
        // unwrap string values if defined in condition value
        if (conditionValue[0] === '"' && conditionValue[conditionValue.length - 1] === '"') {
            conditionValue = conditionValue
                .slice(1, conditionValue.length - 1)
                .replace(/\\"/g, '"');
        }
        const _operator = context.operators.get(operator) as ComparisonOperator;
        return _operator.evaluate(value, conditionValue, tokens, context);
    }

    private getOperandsAndOperator(token: string, operators: Map<string, ComparisonOperator>): string[] {
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
                    for (const [operatorStr, _operator] of operators) {
                        if (this.isOperator(operatorStr, _operator, token, i)) {
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

    private isOperator(operatorStr: string, operator: ComparisonOperator, token: string, index: number): boolean {
        const char = token[index].toUpperCase();
        // for non-symbol operators, if there is a non-whitespace preceding character, it is not an operator
        if (!operator.isSymbol && index > 0 && !/\s/.test(token[index - 1])) {
            return false;
        }
        const matches = (
            // the current character is the first character of the operator being checked
            char === operatorStr[0] &&
            // the current operator fits in the bounds of the token
            index + operatorStr.length - 1 < token.length &&
            // the current character *is* the start of the operator
            token.slice(index, index + operatorStr.length).toUpperCase() === operatorStr
        );
        return matches && (
            operator.isSymbol ||
            // non-symbol operators cannot have non-whitespace preceding characters
            index + operatorStr.length + 1 < token.length ||
            // non-symbol operators must be followed by whitespace
            /\s/.test(token[index + operatorStr.length + 1])
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
        const funcKey = token.slice(0, firstParen).trim().toUpperCase();
        const args = this.parseFunctionArgs(input, funcKey);
        for (let i = 0; i < args.length; i++) {
            if (this.isFunction(args[i], functions)) {
                args[i] = this.evaluateFunction(args[i], functions, context);
            }
        }
        const func = functions.get(funcKey) as ExpressionFunction;
        return func.evaluate(context, ...args);
    }

    private parseFunctionArgs(token: string, funcKey: string): string[] {
        const args = [];
        let buffer = '';
        let inString = false;
        let parenCount = 0;
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            if (char === '"') {
                inString = !inString;
            } else if (char === '(') {
                if (!inString) {
                    parenCount++;
                }
            } else if (char === ')') {
                if (!inString) {
                    parenCount--;
                }
            } else if (char === ',') {
                if (!inString && parenCount === 0) {
                    // only break into new argument if not in string or nested function call
                    const token = buffer.trim();
                    if (token.length === 0) {
                        throw new Error(`SyntaxError: invalid function argument passed to ${funcKey}`);
                    }
                    args.push(token);
                    buffer = '';
                    continue;
                }
            }
            buffer += char;
        }
        if (buffer.trim().length === 0 && token.trim().length > 0) {
            throw new Error(`SyntaxError: invalid function argument passed to ${funcKey}`);
        }
        args.push(buffer.trim());
        return args;
    }
}

export default BaseConditionEvaluator;