import ExpressionContext from "./expression-context";

/**
 * Allows function operations to be executed when evaluating conditions against an object.
 */
type ExpressionFunction = {
    evaluate: <T> (context: ExpressionContext<T>, ...args: any[]) => Promise<any>;
};

export default ExpressionFunction;