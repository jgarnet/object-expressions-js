import ExpressionError from "./expression-error";

class SyntaxError extends ExpressionError {
    constructor(message?: string) {
        super(message);
        this.name = 'SyntaxError';
    }
}

export default SyntaxError;