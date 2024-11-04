import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import ExpressionError from "../expression-error";
import {getField, isCollection, isNumber, isWrapped, requireString} from "../_utils";
import createContext from "../create-context";

const isNil = require("lodash/isNil");

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
        let path = null;
        if (args.length > 2) {
            if (isNumber(args[2])) {
                path = `${args[2]}`;
            } else {
                requireString(context, 'FILTER', args[2]);
                path = args[2];
            }
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
                operators: context.operators,
                functions: context.functions,
                debug: context.debug,
                nestLevel: context.nestLevel + 1
            });
            const matches = await context.expressionEvaluator.evaluate(newContext);
            if (matches) {
                result.push(value);
            }
        }
        if (!isNil(path)) {
            return getField(path, context, result);
        }
        return result;
    }
};

export default filter;