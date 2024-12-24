import ExpressionToken from "./expression-token";
import ExpressionDelimiter from "./expression-delimiter";

export type FragmentParserOptions = {
    allowEmpty?: boolean;
};

/**
 * Parses all fragments contained in a string.
 */
type FragmentParser = {
    /**
     * Parses all fragments contained in a string.
     * @param str The string being parsed.
     * @param tokens Contains all {@link ExpressionToken} which may contain other fragments.
     * @param delimiters Contains all {@link ExpressionDelimiter} which splits fragments.
     * @param options {@link FragmentParserOptions} used during parsing.
     */
    parse(str: string, tokens: Set<ExpressionToken>, delimiters: Set<ExpressionDelimiter>, options?: FragmentParserOptions): string[];
};

export default FragmentParser;