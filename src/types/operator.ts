import ExpressionContext from "./expression-context";

type Operator = {
    evaluate: <T> (value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>) => boolean,
    isSymbol: boolean,
    regex: string
};

export default Operator;