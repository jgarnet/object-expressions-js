import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionContext from "./types/expression-context";
import ComparisonOperator from "./types/comparison-operator";
import {consoleColors, debug, getField, isWrapped, unwrapValue} from "./_utils";

class BaseConditionEvaluator implements ConditionEvaluator {
    evaluate<T>(token: string, context: ExpressionContext<T>): boolean {
        const tokens = this.getOperandsAndOperator(token, context);
        const [operandA, operator, operandB] = tokens;
        if (operandA.length === 0 || operator.length === 0 || operandB.length === 0) {
            throw new Error(`SyntaxError: received invalid condition ${token}`);
        }
        const leftSide = this.getValue(operandA, context);
        const rightSide = this.getValue(operandB, context);
        const _operator = context.operators.get(operator) as ComparisonOperator;
        const result = _operator.evaluate(leftSide, rightSide, tokens, context);
        debug(consoleColors.blue + token + consoleColors.reset + ' = ' +
            (result ? consoleColors.green : consoleColors.red) + result + consoleColors.reset,
            context
        );
        return result;
    }

    private getOperandsAndOperator<T>(token: string, context: ExpressionContext<T>): string[] {
        let operandA = '';
        let operator = '';
        let operandB = '';
        let buffer = '';
        let inString = false;
        let inRegex = false;
        let bracketCount = 0;
        let parenCount = 0;
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            switch (char) {
                case '"':
                    if (!inRegex && bracketCount === 0) {
                        if (!inString) {
                            inString = true;
                        } else if (token[i - 1] !== '\\') {
                            inString = false;
                        }
                    }
                    break;
                case '/':
                    if (!inString && bracketCount === 0) {
                        if (!inRegex) {
                            inRegex = true;
                        } else if (token[i - 1] !== '\\') {
                            inRegex = false;
                        }
                    }
                    break;
                case '[':
                    if (!inRegex && !inString) {
                        bracketCount++;
                    }
                    break;
                case ']':
                    if (!inRegex && !inString) {
                        bracketCount--;
                    }
                    break;
                case '(':
                    if (!inRegex && !inString && bracketCount === 0) {
                        parenCount++;
                    }
                    break;
                case ')':
                    if (!inRegex && !inString && bracketCount === 0) {
                        parenCount--;
                    }
                    break;
            }
            if (!inString && !inRegex && bracketCount === 0 && parenCount === 0) {
                const addOperator = (): boolean => {
                    for (const [operatorStr, _operator] of context.operators) {
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
        return [operandA.trim(), operator.trim(), operandB.trim()];
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

    private getValue<T>(token: string, context: ExpressionContext<T>): any {
        if (token.startsWith('$')) {
            return getField(context, token);
        }
        if (context.functionEvaluator.isFunction(token, context)) {
            return context.functionEvaluator.evaluate(token, context);
        }
        return token;
    }
}

export default BaseConditionEvaluator;