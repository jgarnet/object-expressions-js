import ExpressionContext from "./expression-context";

type ExpressionParser = {
    /**
     * Parses an expression string to identify all child expressions, operators, and conditions.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    parse<T>(context: ExpressionContext<T>): void;
};

export default ExpressionParser;