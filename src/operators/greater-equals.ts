import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";

const greaterEquals: Operator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        return value >= conditionValue;
    }
};

export default greaterEquals;