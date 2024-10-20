import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";

const equals: Operator = {
    evaluate<T>(value: any, target: string, context: ExpressionContext<T>): boolean {
        return value == target;
    }
};

export default equals;