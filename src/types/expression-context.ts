import Operator from "./operator";

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
     * Stores all child expressions contained within the expression being evaluated.
     * Used during evaluation to recursively evaluate child expressions.
     */
    childExpressions?: Set<string>;
    /**
     * Stores all tokens (condition strings, operators, and child expression strings) for the expression being evaluated.
     */
    tokens?: string[];
    operators?: Map<string, Operator>;
};

export default ExpressionContext;