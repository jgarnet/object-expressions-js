class ExpressionError extends Error {
    public cause: Error | undefined;
    constructor(message?: string) {
        super(message);
        this.name = 'ExpressionError';
    }
}

export default ExpressionError;