import ComparisonOperator from "../../comparison-operator";
import ExpressionContext from "../../../expression/context/expression-context";
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");

const is: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
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