import ExpressionParser from "./types/expression-parser";
import ExpressionContext from "./types/expression-context";
import ExpressionFunction from "./types/expression-function";

const LOGICAL_OPERATORS = ['AND', 'OR', 'NOT'];

class BaseExpressionParser implements ExpressionParser {
    parse<T>(context: ExpressionContext<T>): void {
        const expression = context.expression;
        let buffer = '';
        let parenCount = 0;
        let inString = false;
        let funcCount = 0;
        let lastFunctionIndex = -1;
        let inRegex = false;
        let bracketCount = 0;
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            switch (char) {
                case '(':
                    buffer += char;
                    if (!inRegex && !inString && bracketCount === 0) {
                        // represents the start of a root or nested group or function
                        if (parenCount === 0 && this.isFunction(buffer, funcCount, lastFunctionIndex, context)) {
                            // function start
                            funcCount++;
                        } else if (funcCount > 0) {
                            throw new Error(`SyntaxError: received invalid function call in ${context.expression}`);
                        } else {
                            // group start
                            parenCount++;
                        }
                    }
                    break;
                case ')':
                    buffer += char;
                    if (!inRegex && !inString && bracketCount === 0) {
                        // represents the end of a root or nested group or function
                        if (funcCount === 0) {
                            // group end
                            parenCount--;
                            if (parenCount < 0) {
                                throw new Error('SyntaxError: expression contains an unclosed group');
                            }
                            if (parenCount === 0) {
                                // root group has ended
                                // append the group to the tokens array
                                this.addToken(buffer, context);
                                buffer = '';
                                // reset function index for current buffer
                                lastFunctionIndex = -1;
                            }
                        } else {
                            // function call has ended
                            funcCount--;
                            if (funcCount === 0) {
                                // root function call has ended; mark the current index as the last function call
                                lastFunctionIndex = i;
                            }
                        }
                    }
                    break;
                case '"':
                    if (!inRegex && bracketCount === 0) {
                        // represents the start or end of a string
                        if (!inString) {
                            inString = true;
                        } else if (expression[i - 1] !== '\\') {
                            // close current string
                            inString = false;
                        }
                    }
                    buffer += char;
                    break;
                case '/':
                    if (!inString && bracketCount === 0) {
                        // either starting, ending, or inside a regular expression
                        if (i > 0 && expression[i - 1] !== '\\') {
                            inRegex = !inRegex;
                        }
                    }
                    buffer += char;
                    break;
                case '[':
                    if (!inString && !inRegex) {
                        bracketCount++;
                    }
                    buffer += char;
                    break;
                case ']':
                    if (!inString && !inRegex) {
                        bracketCount--;
                        if (bracketCount < 0) {
                            throw new Error(`SyntaxError: expression contains an unclosed field reference: ${expression}`);
                        }
                    }
                    buffer += char;
                    break;
                default:
                    buffer += char;
            }
            // check for operators
            if (bracketCount === 0 && parenCount === 0 && funcCount === 0 && !inString && !inRegex) {
                for (const operator of LOGICAL_OPERATORS) {
                    if (this.isLogicalOperator(operator, expression, i)) {
                        // add the operator to the current tokens
                        this.addLogicalOperator(operator, buffer, context);
                        // clear the current buffer
                        buffer = '';
                        // reset function index for current buffer
                        lastFunctionIndex = -1;
                        // move the buffer index forward past the operator
                        i += operator.length - 1;
                        break;
                    }
                }
            }
        }
        if (bracketCount !== 0) {
            throw new Error(`SyntaxError: expression contains an unclosed field reference: ${expression}`);
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
        if (inRegex) {
            throw new Error('SyntaxError: expression contains an unclosed regular expression');
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
            expression.slice(index, index + operator.length).toUpperCase() === operator &&
            // there are no non-whitespace characters after the operator (if there are characters after)
            (index + operator.length >= expression.length || /\s/.test(expression[index + operator.length]))
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
        const trimmed = token.trim();
        if (trimmed.length > 0) {
            context.tokens.push(trimmed);
        }
    }

    private isFunction<T>(token: string, funcCount: number, lastFunctionIndex: number, context: ExpressionContext<T>): boolean {
        // remove trailing parenthesis, remove whitespace, convert to uppercase
        token = token.slice(0, token.length - 1).trim().toUpperCase();
        if (funcCount > 0) {
            // we are inside a function call; attempt to remove all characters up to the current token
            // i.e. 'ADD(LEN' --> 'LEN' (remove 'AND('), 'ADD(LEN(a), LEN' --> ' LEN' (remove 'ADD(LEN(A),'), etc.
            const lastComma = token.lastIndexOf(',');
            if (lastComma !== -1) {
                const lastQuote = token.lastIndexOf('"');
                if (lastQuote === -1 || lastComma > lastQuote) {
                    // we are inside a function call with other args
                    // i.e. ADD(a, ADD
                    // strip everything from last function arg; i.e. remove "ADD(a," to get " ADD"
                    return context.functions.has(token.slice(lastComma + 1).trim());
                }
            }
            // this is the first argument inside another function
            // i.e. ADD(ADD
            // strip everything from parent function; i.e. remove "ADD(" to get "ADD"
            const lastParen = token.lastIndexOf('(');
            token = token.slice(lastParen + 1).trim();
        }
        // finally, check if this token is preceded by a comparison operator
        token = token.slice(lastFunctionIndex + 1);
        const groups = token.match(context.functionRegex as string);
        if (groups && groups.length >= 0) {
            // remove preceding comparison operator
            return context.functions.has(groups[0].trim());
        } else {
            // we can assume the current token is a possible function call with no preceding operators
            return context.functions.has(token.trim());
        }
    }
}

export default BaseExpressionParser;