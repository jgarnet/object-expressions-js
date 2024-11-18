import ExpressionContext from "./types/expression-context";
import _operators from "./operators/_operators";
import _functions from "./functions/_functions";
import BasePathEvaluator from "./base-path-evaluator";
import BaseConditionEvaluator from "./base-condition-evaluator";
import BaseExpressionParser from "./base-expression-parser";
import BaseFunctionEvaluator from "./base-function-evaluator";
import BaseExpressionEvaluator from "./base-expression-evaluator";
import BaseFragmentParser from "./base-fragment-parser";

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
        fragmentParser: context.fragmentParser ?? new BaseFragmentParser(),
        functionEvaluator: context.functionEvaluator ?? new BaseFunctionEvaluator(),
        cache: context.cache ?? new Map<string, boolean>,
        operators,
        functions,
        debug: context.debug ?? false,
        nestLevel: context.nestLevel ?? 0
    };
};

export default createContext;