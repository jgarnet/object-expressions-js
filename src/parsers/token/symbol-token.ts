/**
 * Represents symbol(s) that wrap tokens inside a string.
 */
type SymbolToken = {
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
     * Determines if characters after the token should be broken into a new token.
     */
    break?: boolean
    /**
     * Determines the precedence in which the token is parsed relative to other tokens.
     */
    precedence?: number;
};

export default SymbolToken;