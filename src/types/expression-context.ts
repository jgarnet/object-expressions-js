import ComparisonOperator from "./comparison-operator";
import ExpressionFunction from "./expression-function";
import PathEvaluator from "./path-evaluator";
import ConditionEvaluator from "./condition-evaluator";
import ExpressionParser from "./expression-parser";
import FunctionEvaluator from "./function-evaluator";
import ExpressionEvaluator from "./expression-evaluator";
import FragmentParser from "./fragment-parser";
import ExpressionDelimiter from "./expression-delimiter";
import ExpressionToken from "./expression-token";

/**
 * Stores data relevant for evaluating expressions.
 * Also provides instances of {@link PathEvaluator}, {@link ConditionEvaluator}, and {@link ExpressionParser}.
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
     * Used to evaluate expressions.
     */
    expressionEvaluator: ExpressionEvaluator;
    /**
     * Used to retrieve a value from the object given a path.
     */
    pathEvaluator: PathEvaluator;
    /**
     * Used to evaluate conditions against an object's values.
     */
    conditionEvaluator: ConditionEvaluator;
    /**
     * Used to parse tokens within an expression.
     */
    expressionParser: ExpressionParser;
    /**
     * Used to parse fragments within an expression.
     */
    fragmentParser: FragmentParser;
    /**
     * Used to evaluate functions during condition evaluation.
     */
    functionEvaluator: FunctionEvaluator;
    /**
     * Caches the outcome for all condition strings and child expressions to avoid duplicate computations.
     */
    cache: Map<string, boolean>;
    /**
     * Stores all comparison operators, mapping their symbol and their associated {@link ComparisonOperator} implementation.
     */
    operators: Map<string, ComparisonOperator>;
    operatorDelimiters: Set<ExpressionDelimiter>;
    standardTokens: Set<ExpressionToken>;
    /**
     * Stores all functions, mapping their name and {@link ExpressionFunction} implementation.
     */
    functions: Map<string, ExpressionFunction>;
    /**
     * Enables debugging output.
     */
    debug: boolean;
    /**
     * Tracks the nest level of a child group. Used for debugging output.
     */
    nestLevel: number;
};

export default ExpressionContext;