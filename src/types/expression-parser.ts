import ExpressionContext from "./expression-context";

/**
 * Parses all tokens (groups, conditions, functions, etc.) within an expression.
 */
type ExpressionParser = {
    /**
     * Parses an expression string to identify all groups, operators, conditions, functions, etc.
     * @param context The {@link ExpressionContext}.
     */
    parse<T>(context: ExpressionContext<T>): void;
};

export default ExpressionParser;