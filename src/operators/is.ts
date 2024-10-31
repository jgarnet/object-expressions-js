import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");

const is: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: any, tokens: string[], context: ExpressionContext<T>): boolean {
        switch (conditionValue.toUpperCase()) {
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
    },
    isSymbol: false,
    regex: '\\sIS\\s'
};

export default is;