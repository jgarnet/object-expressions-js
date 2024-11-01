import ExpressionContext from "./types/expression-context";
import _operators from "./operators/_operators";
import _functions from "./functions/_functions";
import ComparisonOperator from "./types/comparison-operator";
import BasePathEvaluator from "./base-path-evaluator";
import BaseConditionEvaluator from "./base-condition-evaluator";
import BaseExpressionParser from "./base-expression-parser";
import BaseFunctionEvaluator from "./base-function-evaluator";
import BaseExpressionEvaluator from "./base-expression-evaluator";

const createContext = <T> (context: Partial<ExpressionContext<T>>): ExpressionContext<T> => {
    const operators = context.operators ?? new Map(_operators);
    const functions = context.functions ?? new Map(_functions);
    return {
        expression: context.expression as string,
        object: context.object as T,
        expressionEvaluator: context.expressionEvaluator ?? new BaseExpressionEvaluator(),
        pathEvaluator: context.pathEvaluator ?? new BasePathEvaluator(),
        conditionEvaluator: context.conditionEvaluator ?? new BaseConditionEvaluator(),
        expressionParser: context.expressionParser ?? new BaseExpressionParser(),
        functionEvaluator: context.functionEvaluator ?? new BaseFunctionEvaluator(),
        cache: context.cache ?? new Map<string, boolean>,
        operators,
        functions,
        functionRegex: context.functionRegex ?? createFunctionRegex(operators),
        debug: context.debug ?? false,
        nestLevel: context.nestLevel ?? 0
    };
};

const createFunctionRegex = <T> (operators: Map<string, ComparisonOperator>) => {
    const functionKeyRegex = '[^0-9]+[a-zA-Z0-9_]';
    const operatorsRegex = [...operators.values()].map(operator => operator.regex).join('|');
    return `(?<=${operatorsRegex})${functionKeyRegex}`;
};

export default createContext;