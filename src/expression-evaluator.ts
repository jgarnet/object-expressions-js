import ConditionEvaluator from "./types/condition-evaluator";

class ExpressionEvaluator {

    private readonly tokens: string[];
    private conditionEvaluator: ConditionEvaluator;
    private cache: Map<string, boolean>;
    private childExpressions: Set<string>;

    constructor(conditionEvaluator: ConditionEvaluator, cache?: Map<string, boolean>) {
        this.conditionEvaluator = conditionEvaluator;
        this.cache = cache ?? new Map();
        this.tokens = [];
        this.childExpressions = new Set();
    }

    evaluate(expression: string, object: any): boolean {
        if (!expression || expression.trim() === '') {
            throw new Error('Expression cannot be empty.');
        }
        this.parse(expression);
        let isNegate = false;
        let isAnd = false;
        let isOr = false;
        let result = false;
        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            if (token === 'NOT') {
                isNegate = true;
            } else if (token === 'AND') {
                isAnd = true;
            } else if (token === 'OR') {
                isOr = true;
            } else {
                let current = this.evaluateToken(token, object);
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

    private evaluateToken(token: string, object: any): boolean {
        if (this.cache.has(token)) {
            return this.cache.get(token) as boolean;
        }
        let result;
        if (this.childExpressions.has(token)) {
            result = new ExpressionEvaluator(this.conditionEvaluator, this.cache).evaluate(token, object);
        } else {
            result = this.conditionEvaluator.evaluate(token, object);
        }
        this.cache.set(token, result);
        return result;
    }

    private parse(expression: string) {
        let buffer = '';
        let parenCount = 0;
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            // check for child expressions
            if (char === '(') {
                parenCount++;
                if (parenCount > 1) {
                    buffer += char;
                }
            } else if (char === ')') {
                parenCount--;
                if (parenCount === 0) {
                    // end expression
                    this.tokens.push(buffer);
                    this.childExpressions.add(buffer);
                    buffer = '';
                } else {
                    buffer += char;
                }
            } else {
                buffer += char;
            }
            // check for operators
            // todo: refactor to ignore whitespace for each token
            if (parenCount === 0) {
                if (i + 5 < expression.length && expression.slice(i + 1, i + 5) === ' OR ') {
                    if (buffer.length > 0) {
                        this.tokens.push(buffer);
                    }
                    this.tokens.push('OR');
                    buffer = '';
                    i += 4;
                } else if (i + 6 < expression.length && expression.slice(i + 1, i + 6) === ' AND ') {
                    if (buffer.length > 0) {
                        this.tokens.push(buffer);
                    }
                    this.tokens.push('AND');
                    buffer = '';
                    i += 5;
                } else if (i + 6 < expression.length && expression.slice(i + 1, i + 6) === ' NOT ') {
                    if (buffer.length > 0) {
                        this.tokens.push(buffer);
                    }
                    this.tokens.push('NOT');
                    buffer = '';
                    i += 5;
                } else if (i + 4 < expression.length && expression.slice(i, i + 4) === 'NOT ') {
                    this.tokens.push('NOT');
                    buffer = '';
                    i += 3;
                }
            }
        }
        if (buffer.length > 0) {
            this.tokens.push(buffer);
        }
    }
}

export default ExpressionEvaluator;