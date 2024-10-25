import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");

const is: Operator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
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
    regex: 'IS'
};

export default is;