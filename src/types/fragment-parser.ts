import ExpressionToken from "./expression-token";
import ExpressionDelimiter from "./expression-delimiter";

/**
 * Parses all fragments contained in a string.
 */
type FragmentParser = {
    /**
     * Parses all fragments contained in a string.
     * @param str The string being parsed.
     * @param tokens Contains all {@link ExpressionToken} which may contain other fragments.
     * @param delimiters Contains all {@link ExpressionDelimiter} which splits fragments.
     */
    parse(str: string, tokens: Set<ExpressionToken>, delimiters: Set<ExpressionDelimiter>): string[];
};

export default FragmentParser;