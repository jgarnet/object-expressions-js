import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionContext from "./types/expression-context";

const OPERATORS = ['AND', 'OR', 'NOT'];

class ExpressionEvaluator {
    /**
     * Evaluates a condition string against an object.
     * @private
     */
    private conditionEvaluator: ConditionEvaluator;

    constructor(conditionEvaluator: ConditionEvaluator) {
        this.conditionEvaluator = conditionEvaluator;
    }

    /**
     * Parses and evaluates an expression against an object to determine if all conditions apply.
     * @param context The {@link ExpressionContext}.
     */
    evaluate<T>(context: ExpressionContext<T>): boolean {
        // initialize state
        const expression = context.expression;
        if (!expression || expression.trim() === '') {
            throw new Error('Expression cannot be empty.');
        }
        context.tokens = [];
        context.childExpressions = new Set<string>();
        context.cache = context.cache ?? new Map<string, boolean>();
        // parse tokens
        this.parse(context);
        // evaluate tokens and return result
        const tokens = context.tokens;
        let isNegate = false;
        let isAnd = false;
        let isOr = false;
        let result = false;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token === 'NOT') {
                isNegate = true;
            } else if (token === 'AND') {
                isAnd = true;
            } else if (token === 'OR') {
                isOr = true;
            } else {
                let current = this.evaluateToken(token, context);
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
        return result;
    }

    /**
     * Evaluates a token to determine whether the condition(s) apply to the supplied object.
     * @param token A single condition or a child expression.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private evaluateToken<T>(token: string, context: ExpressionContext<T>): boolean {
        const object = context.object;
        const cache = context.cache as Map<string, boolean>;
        const childExpressions = context.childExpressions as Set<string>;
        if (cache.has(token)) {
            return cache.get(token) as boolean;
        }
        let result;
        if (childExpressions.has(token)) {
            const newContext = {
                expression: token,
                object,
                cache: context.cache
            };
            result = new ExpressionEvaluator(this.conditionEvaluator).evaluate(newContext);
        } else {
            result = this.conditionEvaluator.evaluate(token, object);
        }
        cache.set(token, result);
        return result;
    }

    /**
     * Parses the expression string to identify all child expressions, operators, and conditions.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private parse<T>(context: ExpressionContext<T>) {
        const expression = context.expression;
        const childExpressions = context.childExpressions as Set<string>;
        let buffer = '';
        let parenCount = 0;
        let inString = false;
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            if (char === '(') {
                // check for new child expressions
                parenCount++;
                if (parenCount > 1) {
                    buffer += char;
                }
            } else if (char === ')') {
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
            } else if (char === '"') {
                // keep track of quotes for strings with whitespace
                if (!inString) {
                    inString = true;
                } else {
                    // close current string
                    inString = false;
                }
                buffer += char;
            } else if (/\s/.test(char)) {
                if (inString) {
                    // allow whitespace to be preserved inside a string
                    // todo: determine if preserveWhitespace option should be added to toggle this part
                    buffer += char;
                } else {
                    // if not inside a string, replace all whitespace with spaces
                    buffer += ' ';
                }
            } else {
                // normal use case -- not inside child expression, string, etc. -- simply append to buffer
                buffer += char;
            }
            // check for operators
            if (parenCount === 0 && !inString) {
                for (const operator of OPERATORS) {
                    if (this.isOperator(operator, expression, i)) {
                        // add the operator to the current tokens
                        this.addOperator(operator, buffer, context);
                        // clear the current buffer
                        buffer = '';
                        // move the buffer index forward past the operator
                        i += operator.length - 1;
                        break;
                    }
                }
            }
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
    private isOperator(operator: string, expression: string, index: number): boolean {
        const char = expression[index];
        return (
            // the current character is the first character of the operator being checked
            char === operator[0] &&
            // the current operator fits in the bounds of the token
            index + operator.length < expression.length &&
            // the current character *is* the start of the operator
            expression.slice(index, index + operator.length) === operator
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
    private addOperator<T>(operator: string, buffer: string, context: ExpressionContext<T>): void {
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
}

export default ExpressionEvaluator;