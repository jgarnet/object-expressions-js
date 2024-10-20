import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";

const like: Operator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        return new RegExp(conditionValue).test(`${value}`);
    }
};

export default like;