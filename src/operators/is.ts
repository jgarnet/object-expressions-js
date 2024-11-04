import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");

const is: ComparisonOperator = {
    evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): boolean {
        switch (rightSide.toUpperCase()) {
            case 'EMPTY':
                return isEmpty(leftSide);
            case "NULL":
                return isNil(leftSide);
            case "TRUE":
                return leftSide === true;
            case "FALSE":
                return leftSide === false;
        }
        return false;
    },
    precedence: 1
};

export default is;