import FunctionEvaluator from "./types/function-evaluator";
import ExpressionContext from "./types/expression-context";
import ExpressionFunction from "./types/expression-function";
import {getField} from "./_utils";
import ExpressionError from "./expression-error";

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
        return context.functions.has(possibleKey);
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
        const args = this.parseFunctionArgs(input, funcKey);
        for (let i = 0; i < args.length; i++) {
            if (this.isFunction(args[i], context)) {
                args[i] = await this.evaluate(args[i], context);
            } else if (typeof args[i] === 'string' && args[i].startsWith('$')) {
                args[i] = getField(args[i], context);
            }
        }
        const func = context.functions.get(funcKey) as ExpressionFunction;
        return await func.evaluate(context, ...args);
    }

    /**
     * Parses function call token to retrieve all function arguments.
     * @param token The token containing a function call.
     * @param funcKey The name of the function being called.
     * @private
     */
    private parseFunctionArgs(token: string, funcKey: string): string[] {
        const args = [];
        let buffer = '';
        let inString = false;
        let inRegex = false;
        let parenCount = 0;
        let bracketCount = 0;
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            switch (char) {
                case '"':
                    if (!inRegex && bracketCount === 0) {
                        if (!inString) {
                            inString = true;
                        } else if (token[i - 1] !== '\\') {
                            inString = false;
                        }
                    }
                    break;
                case '(':
                    if (!inString && !inRegex && bracketCount === 0) {
                        parenCount++;
                    }
                    break;
                case ')':
                    if (!inString && !inRegex && bracketCount === 0) {
                        parenCount--;
                    }
                    break;
                case '/':
                    if (!inString && bracketCount === 0) {
                        if (!inRegex) {
                            inRegex = true;
                        } else if (token[i - 1] !== '\\') {
                            inRegex = false;
                        }
                    }
                    break;
                case ',':
                    if (!inString && !inRegex && parenCount === 0 && bracketCount === 0) {
                        // only break into new argument if not in string or nested function call
                        const token = buffer.trim();
                        if (token.length === 0) {
                            throw new ExpressionError(`invalid function argument passed to ${funcKey}`);
                        }
                        args.push(token);
                        buffer = '';
                        continue;
                    }
                    break;
                case '[':
                    if (!inRegex && !inString) {
                        bracketCount++;
                    }
                    break;
                case ']':
                    if (!inRegex && !inString) {
                        bracketCount--;
                    }
                    break;
            }
            buffer += char;
        }
        if (buffer.trim().length === 0 && token.trim().length > 0) {
            throw new ExpressionError(`invalid function argument passed to ${funcKey}`);
        }
        args.push(buffer.trim());
        return args;
    }
}

export default BaseFunctionEvaluator;