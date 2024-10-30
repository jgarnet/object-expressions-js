import ExpressionContext from "./types/expression-context";
import _operators from "./operators/_operators";
import _functions from "./functions/_functions";
import ComparisonOperator from "./types/comparison-operator";
import BasePathEvaluator from "./base-path-evaluator";
import BaseConditionEvaluator from "./base-condition-evaluator";
import BaseExpressionParser from "./base-expression-parser";

const createContext = <T> (context: Partial<ExpressionContext<T>>): ExpressionContext<T> => {
    const operators = context.operators ?? new Map(_operators);
    const functions = context.functions ?? new Map(_functions);
    return {
        expression: context.expression as string,
        object: context.object as T,
        pathEvaluator: context.pathEvaluator ?? new BasePathEvaluator(),
        conditionEvaluator: context.conditionEvaluator ?? new BaseConditionEvaluator(),
        expressionParser: context.expressionParser ?? new BaseExpressionParser(),
        cache: context.cache ?? new Map<string, boolean>,
        tokens: context.tokens ?? [],
        operators,
        functions,
        functionRegex: context.functionRegex ?? createFunctionRegex(operators)
    };
};

const createFunctionRegex = <T> (operators: Map<string, ComparisonOperator>) => {
    const functionKeyRegex = '[^0-9]+[a-zA-Z0-9_]';
    const operatorsRegex = [...operators.values()].map(operator => operator.regex).join('|');
    return `(?<=${operatorsRegex})${functionKeyRegex}`;
};

export default createContext;