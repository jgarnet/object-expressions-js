import ExpressionContext from "./types/expression-context";
import ExpressionEvaluator from "./types/expression-evaluator";
import {isWrapped, unwrapString} from "./_utils";
import createContext from "./create-context";

class BaseExpressionEvaluator implements ExpressionEvaluator {
    /**
     * Parses and evaluates an expression against an object to determine if all conditions apply.
     * @param initialContext The {@link ExpressionContext}.
     */
    evaluate<T>(initialContext: Partial<ExpressionContext<T>>): boolean {
        const context = createContext(initialContext);
        // initialize state
        const expression = context.expression;
        if (!expression || expression.trim() === '') {
            throw new Error('Expression cannot be empty.');
        }
        // parse tokens
        context.expressionParser.parse(context);
        // evaluate tokens and return result
        const tokens = context.tokens;
        let isNegate = false;
        let isAnd = false;
        let isOr = false;
        let result = false;
        for (let i = 0; i < tokens.length; i++) {
            const isGroup = isWrapped(tokens[i], '(', ')');
            const token = isGroup ? unwrapString(tokens[i], '(', ')') : tokens[i];
            if (token === 'NOT') {
                isNegate = !isNegate;
            } else if (token === 'AND') {
                if (isAnd || isOr) {
                    throw new Error(`SyntaxError: incomplete logical operation detected in ${expression}`);
                }
                isAnd = true;
            } else if (token === 'OR') {
                if (isAnd || isOr) {
                    throw new Error(`SyntaxError: incomplete logical operation detected in ${expression}`);
                }
                isOr = true;
            } else {
                let current = this.evaluateToken(token, isGroup, context);
                if (isNegate) {
                    current = !current;
                    isNegate = false;
                }
                if (isAnd) {
                    isAnd = false;
                    if (!current || !result) {
                        return false;
                    }
                } else if (isOr) {
                    isOr = false;
                    if (!current && !result) {
                        return false;
                    }
                    current = true;
                }
                result = current;
            }
        }
        if (isNegate || isAnd || isOr) {
            throw new Error(`SyntaxError: incomplete logical operation detected in ${expression}`);
        }
        return result;
    }

    /**
     * Evaluates a token to determine whether the condition(s) apply to the supplied object.
     * @param token A single condition or a child expression.
     * @param isGroup Specifies if the current token is a child group.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private evaluateToken<T>(token: string, isGroup: boolean, context: ExpressionContext<T>): boolean {
        const object = context.object;
        const cache = context.cache as Map<string, boolean>;
        if (cache.has(token)) {
            return cache.get(token) as boolean;
        }
        let result;
        if (isGroup) {
            // https://youtrack.jetbrains.com/issue/WEB-36766
            // noinspection TypeScriptValidateTypes
            const newContext: ExpressionContext<T> = createContext({
                expression: token,
                object,
                cache: context.cache,
                operators: context.operators,
                functions: context.functions,
                functionRegex: context.functionRegex
            });
            result = this.evaluate(newContext);
        } else {
            result = context.conditionEvaluator.evaluate(token, context);
        }
        cache.set(token, result);
        return result;
    }
}

export default BaseExpressionEvaluator;