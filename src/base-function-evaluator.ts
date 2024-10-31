import FunctionEvaluator from "./types/function-evaluator";
import ExpressionContext from "./types/expression-context";
import ExpressionFunction from "./types/expression-function";

class BaseFunctionEvaluator implements FunctionEvaluator {
    isFunction<T>(token: string, context: ExpressionContext<T>): boolean {
        const firstParen = token.indexOf('(');
        const lastParen = token.lastIndexOf(')');
        if (firstParen === -1 || lastParen === -1) {
            return false;
        }
        const possibleKey = token.slice(0, firstParen).trim().toUpperCase();
        return context.functions.has(possibleKey);
    }
    evaluate<T, R>(token: string, context: ExpressionContext<T>): any {
        const firstParen = token.indexOf('(');
        const lastParen = token.lastIndexOf(')');
        const input = token.slice(firstParen + 1, lastParen);
        const funcKey = token.slice(0, firstParen).trim().toUpperCase();
        const args = this.parseFunctionArgs(input, funcKey);
        for (let i = 0; i < args.length; i++) {
            if (this.isFunction(args[i], context)) {
                args[i] = this.evaluate(args[i], context);
            }
        }
        const func = context.functions.get(funcKey) as ExpressionFunction;
        return func.evaluate(context, ...args);
    }

    private parseFunctionArgs(token: string, funcKey: string): string[] {
        const args = [];
        let buffer = '';
        let inString = false;
        let inRegex = false;
        let parenCount = 0;
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            switch (char) {
                case '"':
                    if (!inRegex) {
                        if (!inString) {
                            inString = true;
                        } else if (token[i - 1] !== '\\') {
                            inString = false;
                        }
                    }
                    break;
                case '(':
                    if (!inString && !inRegex) {
                        parenCount++;
                    }
                    break;
                case ')':
                    if (!inString && !inRegex) {
                        parenCount--;
                    }
                    break;
                case '/':
                    if (!inString) {
                        if (!inRegex) {
                            inRegex = true;
                        } else if (token[i - 1] !== '\\') {
                            inRegex = false;
                        }
                    }
                    break;
                case ',':
                    if (!inString && !inRegex && parenCount === 0) {
                        // only break into new argument if not in string or nested function call
                        const token = buffer.trim();
                        if (token.length === 0) {
                            throw new Error(`SyntaxError: invalid function argument passed to ${funcKey}`);
                        }
                        args.push(token);
                        buffer = '';
                        continue;
                    }
                    break;
            }
            buffer += char;
        }
        if (buffer.trim().length === 0 && token.trim().length > 0) {
            throw new Error(`SyntaxError: invalid function argument passed to ${funcKey}`);
        }
        args.push(buffer.trim());
        return args;
    }
}

export default BaseFunctionEvaluator;