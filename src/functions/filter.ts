import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import ExpressionError from "../expression-error";
import {isCollection, isWrapped, requireString} from "../utils";
import createContext from "../create-context";

const filter: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
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
                fragmentParser: context.fragmentParser,
                operators: context.operators,
                operatorDelimiters: context.operatorDelimiters,
                standardTokens: context.standardTokens,
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