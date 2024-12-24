import ExpressionContext from "./expression-context";

/**
 * Contains all information needed to evaluate a function.
 */
type FunctionContext<T> = {
    /**
     * A reference to the {@link ExpressionContext}.
     */
    context: ExpressionContext<T>;
    /**
     * All arguments that are being evaluated by the function.
     */
    args: Array<any>;
};

export default FunctionContext;