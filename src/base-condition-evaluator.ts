import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionContext from "./types/expression-context";
import operators from "./operators/operators";
import Operator from "./types/operator";
const get = require("lodash/get");

class BaseConditionEvaluator implements ConditionEvaluator {
    evaluate<T>(token: string, context: ExpressionContext<T>): boolean {
        const object = context.object;
        const _operators = (context.operators ?? operators) as Map<string, Operator>;
        const tokens = this.getOperandsAndOperator(token, _operators);
        const [operandA, operator, operandB] = tokens;
        const value = get(object, operandA.trim());
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
}

export default BaseConditionEvaluator;