import ComparisonOperator from "../../operator/comparison-operator";
import ExpressionFunction from "../../function/expression-function";
import PathEvaluator from "../../path/evaluator/path-evaluator";
import ConditionEvaluator from "../../condition/evaluator/condition-evaluator";
import ExpressionParser from "../parser/expression-parser";
import FunctionEvaluator from "../../function/evaluator/function-evaluator";
import ExpressionEvaluator from "../evaluator/expression-evaluator";
import TokenParser from "../../token/parser/token-parser";
import DelimiterToken from "../../token/delimiter-token";
import SymbolToken from "../../token/symbol-token";

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