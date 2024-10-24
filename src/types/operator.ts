import ExpressionContext from "./expression-context";

type Operator = {
    evaluate: <T> (value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>) => boolean,
    isSymbol: boolean
};

export default Operator;