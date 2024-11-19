/**
 * Represents a delimiter which splits fragments when parsing fragments from a string.
 */
type ExpressionDelimiter = {
    /**
     * The symbol which represents the delimiter.
     */
    symbol: string,
    /**
     * Determines if the delimiter requires whitespace before and after its position in the string.
     */
    whitespace?: boolean,
    /**
     * Determines if the delimiter should be included in the parsed fragments array.
     */
    include?: boolean;
    /**
     * Determines the precedence in which the delimiter is parsed relative to other delimiters.
     */
    precedence?: number;
};

export default ExpressionDelimiter;