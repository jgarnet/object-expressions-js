import ExpressionToken from "./expression-token";
import ExpressionDelimiter from "./expression-delimiter";

type TokenParser = {
    parse(str: string, tokens: ExpressionToken[], delimiters: Set<ExpressionDelimiter>): string[];
};

export default TokenParser;