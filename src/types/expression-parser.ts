import ExpressionContext from "./expression-context";
import ExpressionNode from "./expression-node";

/**
 * Parses all tokens (groups, conditions, functions, etc.) within an expression.
 */
type ExpressionParser = {
    /**
     * Parses an expression string to identify all groups, operators, conditions, functions, etc.
     * @param context The {@link ExpressionContext}.
     */
    parse<T>(context: ExpressionContext<T>): ExpressionNode;
};

export default ExpressionParser;