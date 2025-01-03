import FunctionEvaluator from "./function-evaluator";
import ExpressionContext from "../../expression/context/expression-context";
import ExpressionFunction from "../expression-function";
import {getField} from "../../utils";
import ExpressionError from "../../errors/expression-error";

class BaseFunctionEvaluator implements FunctionEvaluator {
    /**
     * Determines if a token represents a function call.
     * @param token The token being evaluated.
     * @param context The {@link ExpressionContext}.
     */
    isFunction<T>(token: string, context: ExpressionContext<T>): boolean {
        if (!/^(?!<\s)\w+(?=\()/.test(token)) {
            return false;
        }
        const firstParen = token.indexOf('(');
        let parenCount = 0;
        for (let i = firstParen; i < token.length; i++) {
            const char = token[i];
            if (char === '(') {
                parenCount++;
            } else if (char === ')') {
                parenCount--;
                if (parenCount === 0 && i + 1 < token.length) {
                    return false;
                }
            }
        }
        const possibleKey = token.slice(0, firstParen).trim().toUpperCase();
        if (!context.functions.has(possibleKey)) {
            throw new ExpressionError(`Expression contains unknown function: ${possibleKey}`);
        }
        return true;
    }

    /**
     * Evaluates a function call and returns the result.
     * @param token The token containing a function call.
     * @param context The {@link ExpressionContext}.
     */
    async evaluate<T, R>(token: string, context: ExpressionContext<T>): Promise<any> {
        const firstParen = token.indexOf('(');
        const lastParen = token.lastIndexOf(')');
        const input = token.slice(firstParen + 1, lastParen);
        const funcKey = token.slice(0, firstParen).trim().toUpperCase();
        const args = this.parseFunctionArgs(input, context);
        for (let i = 0; i < args.length; i++) {
            if (args[i].trim().length === 0) {
                throw new ExpressionError(`invalid function argument passed to ${funcKey}`);
            }
            if (this.isFunction(args[i], context)) {
                args[i] = await this.evaluate(args[i], context);
            } else if (typeof args[i] === 'string' && args[i].startsWith('$')) {
                args[i] = getField(args[i], context);
            }
        }
        const func = context.functions.get(funcKey) as ExpressionFunction;
        return await func.evaluate({ context, args });
    }

    /**
     * Parses function call token to retrieve all function arguments.
     * @param token The token containing a function call.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private parseFunctionArgs<T>(token: string, context: ExpressionContext<T>): string[] {
        return context.tokenParser.parse(
            token,
            context.standardSymbols,
            new Set([
                { symbol: ',' }
            ]),
            {
                allowEmpty: true
            }
        );
    }
}

export default BaseFunctionEvaluator;