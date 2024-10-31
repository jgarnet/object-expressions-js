import ComparisonOperator from "./comparison-operator";
import ExpressionFunction from "./expression-function";
import PathEvaluator from "./path-evaluator";
import ConditionEvaluator from "./condition-evaluator";
import ExpressionParser from "./expression-parser";
import FunctionEvaluator from "./function-evaluator";

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
     * Used to evaluate functions during condition evaluation.
     */
    functionEvaluator: FunctionEvaluator;
    /**
     * Caches the outcome for all condition strings and child expressions to avoid duplicate computations.
     */
    cache: Map<string, boolean>;
    /**
     * Stores all tokens (condition strings, operators, and child expression strings) for the expression being evaluated.
     */
    tokens: string[];
    /**
     * Stores all comparison operators, mapping their symbol and their associated {@link ComparisonOperator} implementation.
     */
    operators: Map<string, ComparisonOperator>;
    /**
     * Stores all functions, mapping their name and {@link ExpressionFunction} implementation.
     */
    functions: Map<string, ExpressionFunction>;
    /**
     * Used during parsing to determine if a token is a function which is preceded by a comparison operator.
     * i.e. "2>MY_FUNC()" or "2 > MY_FUNC()" are both function calls which are preceded by a comparison operator.
     */
    functionRegex: string;
};

export default ExpressionContext;