import ConditionEvaluator from "./types/condition-evaluator";
const get = require("lodash/get");
const has = require("lodash/has");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");
const some = require("lodash/some");

class BaseConditionEvaluator implements ConditionEvaluator {
    evaluate(token: string, object: any): boolean {
        const [operandA, operator, operandB] = this.getOperandsAndOperator(token);
        const value = get(object, operandA.trim());
        let target = operandB.trim();
        if (target[0] === '"' && target[target.length - 1] === '"') {
            target = target.slice(1, target.length - 1).replace(/\\"/g, '"');
        }
        switch (operator.toUpperCase()) {
            case '=':
                return value == target;
            case '>':
                return value > target;
            case '<':
                return value < target;
            case '>=':
                return value >= target;
            case '<=':
                return value <= target;
            case 'LIKE':
                return new RegExp(target).test(`${value}`);
            case 'IN':
                const values = target.split(',').map(val => val.trim());
                return some(values, (val: any) => val == value);
            case 'HAS':
                if (operandA === '$') {
                    return has(object, target);
                }
                return has(value, target);
            case 'IS':
                switch (target.toUpperCase()) {
                    case 'EMPTY':
                        return isEmpty(value);
                    case "NULL":
                        return isNil(value);
                    case "TRUE":
                        return value === true;
                    case "FALSE":
                        return value === false;
                }
                return false;
        }
        return false;
    }

    private getOperandsAndOperator(token: string): string[] {
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
                const addOperator = (...operators: string[]): boolean => {
                    for (const operatorStr of operators) {
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
                const isOperator = addOperator(
                    'LIKE',
                    'IN',
                    'IS',
                    'HAS',
                    '>=',
                    '<=',
                    '>',
                    '<',
                    '='
                );
                if (isOperator) {
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