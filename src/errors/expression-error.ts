class ExpressionError extends Error {
    public cause: Error | undefined;
    public expression: string | undefined;
    constructor(message?: string) {
        super(message);
        this.name = 'ExpressionError';
    }
}

export default ExpressionError;