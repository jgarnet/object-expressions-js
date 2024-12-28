import ComparisonOperator from "../operators/comparison-operator";
import ExpressionFunction from "../functions/expression-function";
import PathEvaluator from "../evaluators/path/path-evaluator";
import ConditionEvaluator from "../evaluators/condition/condition-evaluator";
import ExpressionParser from "../parsers/expression/expression-parser";
import FunctionEvaluator from "../evaluators/function/function-evaluator";
import ExpressionEvaluator from "../evaluators/expression/expression-evaluator";
import TokenParser from "../parsers/token/token-parser";
import DelimiterToken from "../parsers/token/delimiter-token";
import SymbolToken from "../parsers/token/symbol-token";

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
     * Used to parse tokens within an expression.
     */
    tokenParser: TokenParser;
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
     * Each operator should be represented using a {@link DelimiterToken}.
     * If this is not supplied, this field will be auto-generated based on the operators Map.
     */
    operatorDelimiters: Set<DelimiterToken>;
    /**
     * Contains all standard tokens representing symbols and symbol groups when parsing tokens.
     * Default values include (), [], ", /.
     */
    standardSymbols: Set<SymbolToken>;
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