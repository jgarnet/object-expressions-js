/**
 * Represents symbol(s) that wrap fragments inside a string.
 */
type ExpressionToken = {
    /**
     * The symbol (or start symbol) that represents the token.
     */
    symbol: string,
    /**
     * The close symbol, if the token contains one.
     */
    closeSymbol?: string,
    /**
     * Determines if the symbol / closeSymbol may be escaped using a backslash.
     */
    escapable?: boolean,
    /**
     * Determines if fragments before and after the token will be split when parsing tokens in a string.
     */
    delimiter?: boolean
};

export default ExpressionToken;