import ComparisonOperator from "../../comparison-operator";
import ExpressionContext from "../../../expression/context/expression-context";
import {isWrapped, unwrapString, unwrapValue} from "../../../utils";

const like: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
        if (isWrapped(leftSide, '/', '/')) {
            leftSide = unwrapValue(leftSide, '/', '/');
        } else {
            leftSide = unwrapString(leftSide);
        }
        if (isWrapped(rightSide, '/', '/')) {
            rightSide = unwrapValue(rightSide, '/', '/');
        } else {
            rightSide = unwrapString(rightSide);
        }
        return new RegExp(rightSide).test(`${leftSide}`);
    },
    precedence: 1
};

export default like;