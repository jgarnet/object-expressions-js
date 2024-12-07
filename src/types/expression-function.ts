import FunctionContext from "./function-context";

/**
 * Allows function operations to be executed when evaluating conditions against an object.
 */
type ExpressionFunction = {
    evaluate: <T> (ctx: FunctionContext<T>) => Promise<any>;
};

export default ExpressionFunction;