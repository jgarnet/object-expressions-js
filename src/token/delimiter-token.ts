/**
 * Represents a delimiter which splits other tokens during parsing.
 */
type DelimiterToken = {
    /**
     * The symbol which represents the delimiter.
     */
    symbol: string,
    /**
     * Determines if the delimiter requires whitespace before and after its position in the string.
     */
    whitespace?: boolean,
    /**
     * Determines if the delimiter should be included in the parsed tokens array.
     */
    include?: boolean;
    /**
     * Determines the precedence in which the delimiter is parsed relative to other delimiters.
     */
    precedence?: number;
};

export default DelimiterToken;