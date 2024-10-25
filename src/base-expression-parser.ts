import ExpressionParser from "./types/expression-parser";
import ExpressionContext from "./types/expression-context";
import ExpressionFunction from "./types/expression-function";

const LOGICAL_OPERATORS = ['AND', 'OR', 'NOT'];

class BaseExpressionParser implements ExpressionParser {
    parse<T>(context: ExpressionContext<T>): void {
        const expression = context.expression;
        const childExpressions = context.childExpressions as Set<string>;
        let buffer = '';
        let parenCount = 0;
        let inString = false;
        let funcCount = 0;
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            if (char === '(') {
                if (parenCount === 0 && this.isFunction(buffer, funcCount, context.functions as Map<string, ExpressionFunction>)) {
                    funcCount++;
                    buffer += char;
                } else {
                    // check for new child expressions
                    parenCount++;
                    if (parenCount > 1) {
                        buffer += char;
                    }
                }
            } else if (char === ')') {
                if (funcCount === 0) {
                    parenCount--;
                    if (parenCount === 0) {
                        // end child expression
                        this.addToken(buffer, context);
                        childExpressions.add(buffer.trim());
                        buffer = '';
                    } else {
                        // continue appending characters to child expression
                        buffer += char;
                    }
                } else {
                    funcCount--;
                    buffer += char;
                }
            } else if (char === '"') {
                // keep track of quotes for strings with whitespace
                if (!inString) {
                    inString = true;
                } else if (expression[i - 1] !== '\\') {
                    // close current string
                    inString = false;
                }
                buffer += char;
            } else if (/\s/.test(char)) {
                if (inString) {
                    // allow whitespace to be preserved inside a string
                    // todo: determine if preserveWhitespace option should be added to toggle this part
                    buffer += char;
                } else if (i > 0 && !/\s/.test(expression[i - 1])) {
                    // if not inside a string, only allow one space between tokens
                    buffer += ' ';
                }
            } else {
                // normal use case -- not inside child expression, string, etc. -- simply append to buffer
                buffer += char;
            }
            // check for operators
            if (parenCount === 0 && funcCount === 0 && !inString) {
                for (const operator of LOGICAL_OPERATORS) {
                    if (this.isLogicalOperator(operator, expression, i)) {
                        // add the operator to the current tokens
                        this.addLogicalOperator(operator, buffer, context);
                        // clear the current buffer
                        buffer = '';
                        // move the buffer index forward past the operator
                        i += operator.length - 1;
                        break;
                    }
                }
            }
        }
        if (funcCount > 0 || funcCount < 0) {
            throw new Error('SyntaxError: expression contains an unclosed function');
        }
        if (parenCount > 0 || parenCount < 0) {
            throw new Error('SyntaxError: expression contains an unclosed group');
        }
        if (inString) {
            throw new Error('SyntaxError: expression contains an unclosed string');
        }
        // if a buffer remains, add it as a token
        if (buffer.length > 0) {
            this.addToken(buffer, context);
        }
    }

    /**
     * Checks if the current character in the parsing buffer is the start of an operator.
     * @param operator The operator being checked.
     * @param expression The expression string being parsed.
     * @param index The index of the current position / character in the expression string.
     * @private
     */
    private isLogicalOperator(operator: string, expression: string, index: number): boolean {
        const char = expression[index].toUpperCase();
        // if there is a non-whitespace preceding character, this is not a logical operator
        if (index > 0 && !/\s/.test(expression[index - 1])) {
            return false;
        }
        return (
            // the current character is the first character of the operator being checked
            char === operator[0] &&
            // the current operator fits in the bounds of the token
            index + operator.length - 1 < expression.length &&
            // the current character *is* the start of the operator
            expression.slice(index, index + operator.length).toUpperCase() === operator
        );
    }

    /**
     * Adds an operator to the collection of tokens contained in the expression string.
     * If a buffer is already populated, it will be added to the token collection as well.
     * @param operator The operator being added.
     * @param buffer The current buffer that has been parsed up until this point in the expression string.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private addLogicalOperator<T>(operator: string, buffer: string, context: ExpressionContext<T>): void {
        buffer = buffer.slice(0, buffer.length - 1);
        this.addToken(buffer, context);
        this.addToken(operator, context);
    }

    /**
     * Adds a token which represents a condition string, an operator, or a child expression contained within the expression string.
     * @param token The value being added to the token collection.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private addToken<T>(token: string, context: ExpressionContext<T>): void {
        const tokens = context.tokens as string[];
        const trimmed = token.trim();
        if (trimmed.length > 0) {
            tokens.push(trimmed);
        }
    }

    private isFunction<T>(token: string, funcCount: number, functions: Map<string, ExpressionFunction>): boolean {
        token = token.trim().toUpperCase();
        if (funcCount === 0) {
            return functions.has(token);
        }
        const lastComma = token.lastIndexOf(',');
        if (lastComma !== -1) {
            const lastQuote = token.lastIndexOf('"');
            if (lastQuote === -1 || lastComma > lastQuote) {
                return functions.has(token.slice(lastComma + 1).trim());
            }
        }
        const lastParen = token.lastIndexOf('(');
        return functions.has(token.slice(lastParen + 1).trim());
    }
}

export default BaseExpressionParser;