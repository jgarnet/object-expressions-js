import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionContext from "./types/expression-context";
import ComparisonOperator from "./types/comparison-operator";
import {consoleColors, debug, getField} from "./_utils";
import SyntaxError from "./syntax-error";

class BaseConditionEvaluator implements ConditionEvaluator {
    async evaluate<T>(token: string, context: ExpressionContext<T>): Promise<boolean> {
        const tokens = this.getTokens(token, context);
        const [operandA, operator, operandB] = tokens;
        if (operandA.length === 0 || operator.length === 0 || operandB.length === 0) {
            throw new SyntaxError(`received invalid condition ${token}`);
        }
        const leftSide = await this.evaluateOperand(operandA, context);
        const rightSide = await this.evaluateOperand(operandB, context);
        const _operator = context.operators.get(operator) as ComparisonOperator;
        const result = _operator.evaluate(leftSide, rightSide, context);
        debug(consoleColors.blue + token + consoleColors.reset + ' = ' +
            (result ? consoleColors.green : consoleColors.red) + result + consoleColors.reset,
            context
        );
        return result;
    }

    /**
     * Extracts the operator and operands from the condition operation.
     * @param token The condition operation.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private getTokens<T>(token: string, context: ExpressionContext<T>): string[] {
        let operandA = '';
        let operator = '';
        let operandB = '';
        let buffer = '';
        let inString = false;
        let inRegex = false;
        let bracketCount = 0;
        let parenCount = 0;
        const operatorKeys = [...context.operators.keys()].sort((a, b) => {
            const operatorA = context.operators.get(a) as ComparisonOperator;
            const operatorB = context.operators.get(b) as ComparisonOperator;
            if (operatorA.precedence > operatorB.precedence) {
                // higher precedence should be prioritized
                return -1;
            } else if (operatorA.precedence < operatorB.precedence) {
                return 1;
            }
            return 0;
        });
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
                    for (const operatorStr of operatorKeys) {
                        const _operator = context.operators.get(operatorStr) as ComparisonOperator;
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

    /**
     * Determine if the current fragment is a comparison operator when parsing a condition operation.
     * @param operatorStr The string value of the operator being checked.
     * @param operator The {@link ComparisonOperator} being checked.
     * @param token The condition operation string.
     * @param index The current index in the condition operation string.
     * @private
     */
    private isOperator(operatorStr: string, operator: ComparisonOperator, token: string, index: number): boolean {
        const char = token[index].toUpperCase();
        const isSymbol = !/\w/.test(operatorStr);
        // for non-symbol operators, if there is a non-whitespace preceding character, it is not an operator
        if (!isSymbol && index > 0 && !/\s/.test(token[index - 1])) {
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
            isSymbol ||
            // non-symbol operators cannot have non-whitespace preceding characters
            index + operatorStr.length + 1 < token.length ||
            // non-symbol operators must be followed by whitespace
            /\s/.test(token[index + operatorStr.length + 1])
        );
    }

    /**
     * Evaluates and returns the value of an operand.
     * @param token The operand.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private async evaluateOperand<T>(token: string, context: ExpressionContext<T>): Promise<any> {
        if (token.startsWith('$')) {
            // the operand is a field or object reference -- return the result
            return getField(token, context);
        }
        if (context.functionEvaluator.isFunction(token, context)) {
            // the operand is a function call -- return the result
            return context.functionEvaluator.evaluate(token, context);
        }
        // the operand is some primitive or other value -- return as-is
        return token;
    }
}

export default BaseConditionEvaluator;