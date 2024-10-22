import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";

const greaterThan: Operator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        return value > conditionValue;
    },
    isSymbol: true
};

export default greaterThan;