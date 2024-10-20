import ExpressionContext from "./expression-context";

type Operator = {
    evaluate: <T> (value: any, target: string, context: ExpressionContext<T>) => boolean
};

export default Operator;