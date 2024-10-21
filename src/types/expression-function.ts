import ExpressionContext from "./expression-context";

type ExpressionFunction = {
    evaluate: <T> (context: ExpressionContext<T>, ...args: any[]) => any;
};

export default ExpressionFunction;