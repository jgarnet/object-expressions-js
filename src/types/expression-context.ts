import Operator from "./operator";
import ExpressionFunction from "./expression-function";

/**
 * Stores data relevant for evaluating expressions.
 */
type ExpressionContext<T> = {
    /**
     * The expression string being evaluated.
     * Contains conditions, operators, and child expressions.
     */
    expression: string;
    /**
     * The object being evaluated.
     */
    object: T;
    /**
     * Caches the outcome for all condition strings and child expressions to avoid duplicate computations.
     */
    cache?: Map<string, boolean>;
    /**
     * Stores all tokens (condition strings, operators, and child expression strings) for the expression being evaluated.
     */
    tokens?: string[];
    /**
     * Stores all comparison operators, mapping their symbol and their associated {@link Operator} implementation.
     */
    operators?: Map<string, Operator>;
    /**
     * Stores all functions, mapping their name and {@link ExpressionFunction} implementation.
     */
    functions?: Map<string, ExpressionFunction>;
    /**
     * Used during parsing to determine if a token is a function which is preceded by a comparison operator.
     * i.e. "2>MY_FUNC()" or "2 > MY_FUNC()" are both function calls which are preceded by a comparison operator.
     */
    functionRegex?: string;
};

export default ExpressionContext;