import ExpressionContext from "./expression-context";

type ExpressionEvaluator = {
    evaluate<T>(context: ExpressionContext<T>): boolean;
};

export default ExpressionEvaluator;