import ExpressionParser from "./types/expression-parser";
import ExpressionContext from "./types/expression-context";
import ExpressionNode from "./types/expression-node";
import SyntaxError from "./syntax-error";

const LOGICAL_OPERATORS = ['AND', 'OR', 'NOT'];

class BaseExpressionParser implements ExpressionParser {
    parse<T>(context: ExpressionContext<T>): ExpressionNode {
        const expression = context.expression;
        let buffer = '';
        let parenCount = 0;
        let inString = false;
        let funcCount = 0;
        let inRegex = false;
        let bracketCount = 0;
        const tokens: string[] = [];
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            switch (char) {
                case '(':
                    buffer += char;
                    if (!inRegex && !inString && bracketCount === 0) {
                        // represents the start of a root or nested group or function
                        if (parenCount === 0 && /(?!<\s)\w+(?=\()/.test(buffer)) {
                            if (!this.isFunction(buffer, context)) {
                                throw new SyntaxError(`Unknown function ${buffer.match(/(?!<\s)\w+(?=\()/g)?.pop()}() contained in ${expression}`);
                            }
                            // function start
                            funcCount++;
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
                                throw new SyntaxError('expression contains an unclosed group');
                            }
                            if (parenCount === 0) {
                                // root group has ended
                                // append the group to the tokens array
                                this.addToken(buffer, tokens);
                                buffer = '';
                            }
                        } else {
                            // function call has ended
                            funcCount--;
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
                            throw new SyntaxError(`expression contains an unclosed field reference: ${expression}`);
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
                        this.addLogicalOperator(operator, buffer, tokens);
                        // clear the current buffer
                        buffer = '';
                        // move the buffer index forward past the operator
                        i += operator.length - 1;
                        break;
                    }
                }
            }
        }
        if (bracketCount !== 0) {
            throw new Error(`expression contains an unclosed field reference: ${expression}`);
        }
        if (funcCount > 0 || funcCount < 0) {
            throw new SyntaxError('expression contains an unclosed function');
        }
        if (parenCount > 0 || parenCount < 0) {
            throw new SyntaxError('expression contains an unclosed group');
        }
        if (inString) {
            throw new SyntaxError('expression contains an unclosed string');
        }
        if (inRegex) {
            throw new SyntaxError('expression contains an unclosed regular expression');
        }
        // if a buffer remains, add it as a token
        if (buffer.length > 0) {
            this.addToken(buffer, tokens);
        }
        return this.buildNodes(tokens, context);
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
     * @param tokens The current tokens.
     * @private
     */
    private addLogicalOperator<T>(operator: string, buffer: string, tokens: string[]): void {
        buffer = buffer.slice(0, buffer.length - 1);
        this.addToken(buffer, tokens);
        this.addToken(operator, tokens);
    }

    /**
     * Adds a token which represents a condition string, an operator, or a child expression contained within the expression string.
     * @param token The value being added to the token collection.
     * @param tokens The current tokens.
     * @private
     */
    private addToken<T>(token: string, tokens: string[]): void {
        const trimmed = token.trim();
        if (trimmed.length > 0) {
            tokens.push(trimmed);
        }
    }

    /**
     * Determines if the token is a defined function.
     * @param token The token being evaluated.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private isFunction<T>(token: string, context: ExpressionContext<T>): boolean {
        const groups = token.toUpperCase().trim().match(/(?!<\s)\w+(?=\()/g);
        return groups !== null && context.functions.has(groups.pop() ?? '');
    }

    /**
     * Transforms all parsed tokens into ExpressionNodes.
     * @param tokens All tokens parsed from the expression.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private buildNodes<T>(tokens: string[], context: ExpressionContext<T>): ExpressionNode {
        const root: ExpressionNode = {
            token: '',
            negate: false
        };
        let current = root;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token === 'NOT') {
                if (current.token.trim() !== '' || i + 1 >= tokens.length) {
                    throw new SyntaxError(`incomplete logical operation detected in ${context.expression}`);
                }
                current.negate = !current.negate;
            } else if (token === 'OR' || token === 'AND') {
                if (current.token.trim() === '' || i + 1 >= tokens.length) {
                    throw new SyntaxError(`incomplete logical operation detected in ${context.expression}`);
                }
                const next: ExpressionNode = {
                    token: '',
                    negate: false
                };
                current.next = {
                    node: next,
                    relationship: token
                };
                current = next;
            } else {
                current.token = token;
            }
        }
        return root;
    }
}

export default BaseExpressionParser;