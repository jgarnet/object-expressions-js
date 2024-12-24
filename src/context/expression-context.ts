import ComparisonOperator from "../operators/comparison-operator";
import ExpressionFunction from "../functions/expression-function";
import PathEvaluator from "../evaluators/path/path-evaluator";
import ConditionEvaluator from "../evaluators/condition/condition-evaluator";
import ExpressionParser from "../parsers/expression/expression-parser";
import FunctionEvaluator from "../evaluators/function/function-evaluator";
import ExpressionEvaluator from "../evaluators/expression/expression-evaluator";
import FragmentParser from "../parsers/fragment/fragment-parser";
import ExpressionDelimiter from "../parsers/fragment/expression-delimiter";
import ExpressionToken from "../parsers/fragment/expression-token";

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
    /**
     * Used when parsing comparison operators inside condition strings.
     * Each operator should be represented using a {@link ExpressionDelimiter}.
     * If this is not supplied, this field will be auto-generated based on the operators Map.
     */
    operatorDelimiters: Set<ExpressionDelimiter>;
    /**
     * Contains all standard tokens representing symbols and symbol groups when parsing fragments.
     * Default values include (), [], ", /.
     */
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