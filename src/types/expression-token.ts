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
     * Determines if characters after the token should be broken into a new fragment.
     */
    break?: boolean
};

export default ExpressionToken;