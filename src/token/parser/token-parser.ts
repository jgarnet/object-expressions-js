import SymbolToken from "../symbol-token";
import DelimiterToken from "../delimiter-token";

export type TokenParserOptions = {
    allowEmpty?: boolean;
};

/**
 * Parses all tokens contained in a string.
 */
type TokenParser = {
    /**
     * Parses all tokens contained in a string.
     * @param str The string being parsed.
     * @param symbols Contains all {@link SymbolToken} which may contain other tokens.
     * @param delimiters Contains all {@link DelimiterToken} which splits tokens.
     * @param options {@link TokenParserOptions} used during parsing.
     */
    parse(str: string, symbols: Set<SymbolToken>, delimiters: Set<DelimiterToken>, options?: TokenParserOptions): string[];
};

export default TokenParser;