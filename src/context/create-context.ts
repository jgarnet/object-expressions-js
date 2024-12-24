import ExpressionContext from "./expression-context";
import _operators from "../operators/operators";
import _functions from "../functions/functions";
import BasePathEvaluator from "../evaluators/path/base-path-evaluator";
import BaseConditionEvaluator from "../evaluators/condition/base-condition-evaluator";
import BaseExpressionParser from "../parsers/expression/base-expression-parser";
import BaseFunctionEvaluator from "../evaluators/function/base-function-evaluator";
import BaseExpressionEvaluator from "../evaluators/expression/base-expression-evaluator";
import BaseFragmentParser from "../parsers/fragment/base-fragment-parser";
import ExpressionDelimiter from "../parsers/fragment/expression-delimiter";
import ExpressionToken from "../parsers/fragment/expression-token";

const createContext = <T> (context: Partial<ExpressionContext<T>>): ExpressionContext<T> => {
    const operators = context.operators ?? new Map(_operators);
    const functions = context.functions ?? new Map(_functions);
    const operatorDelimiters= context.operatorDelimiters ?? new Set<ExpressionDelimiter>;
    if (!context.operatorDelimiters) {
        for (const operatorKey of operators.keys()) {
            const isSymbol = !/\w/.test(operatorKey);
            operatorDelimiters.add({
                symbol: operatorKey,
                whitespace: !isSymbol,
                include: true,
                precedence: operators.get(operatorKey)?.precedence
            });
        }
    }
    const standardTokens = context.standardTokens ?? new Set<ExpressionToken>;
    if (!context.standardTokens) {
        standardTokens.add({ symbol: '(', closeSymbol: ')', escapable: true });
        standardTokens.add({ symbol: '[', closeSymbol: ']', escapable: true });
        standardTokens.add({ symbol: '"', escapable: true });
        standardTokens.add({ symbol: '\'', escapable: true });
        standardTokens.add({ symbol: '/', escapable: true });
    }
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
        operatorDelimiters,
        standardTokens,
        functions,
        debug: context.debug ?? false,
        nestLevel: context.nestLevel ?? 0
    };
};

export default createContext;