import ExpressionFunction from "../../expression-function";
import ExpressionContext from "../../../expression/context/expression-context";
import ExpressionError from "../../../errors/expression-error";
import {isCollection, isWrapped, requireString} from "../../../utils";
import createContext from "../../../expression/context/create-context";
import FunctionContext from "../../context/function-context";

const filter: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        if (args.length < 2) {
            throw new ExpressionError(`FILTER() requires a value and an expression to filter by; invalid arguments received in ${context.expression}`);
        }
        if (!isCollection(args[0])) {
            throw new ExpressionError(`FILTER() requires the first argument to contain a collection; invalid argument received in ${context.expression}`);
        }
        requireString(context, 'FILTER', args[1]);
        if (!isWrapped(args[1], '(', ')')) {
            throw new ExpressionError(`FILTER() requires expression argument to be wrapped in parentheses; invalid argument received in ${context.expression}`);
        }
        const result = [];
        for (const value of args[0]) {
            // noinspection TypeScriptValidateTypes
            const newContext: ExpressionContext<T> = createContext({
                expression: args[1],
                object: value,
                expressionEvaluator: context.expressionEvaluator,
                pathEvaluator: context.pathEvaluator,
                conditionEvaluator: context.conditionEvaluator,
                expressionParser: context.expressionParser,
                functionEvaluator: context.functionEvaluator,
                tokenParser: context.tokenParser,
                operators: context.operators,
                operatorDelimiters: context.operatorDelimiters,
                standardSymbols: context.standardSymbols,
                functions: context.functions,
                debug: context.debug,
                nestLevel: context.nestLevel
            });
            const matches = await context.expressionEvaluator.evaluate(newContext);
            if (matches) {
                result.push(value);
            }
        }
        return result;
    }
};

export default filter;