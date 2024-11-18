import TokenParser from "./types/token-parser";
import ExpressionToken from "./types/expression-token";
import ExpressionDelimiter from "./types/expression-delimiter";

class BaseTokenParser implements TokenParser {
    parse(str: string, tokens: ExpressionToken[], delimiters: Set<ExpressionDelimiter>): string[] {
        const tokenSymbols = new Set();
        const symbolMap = new Map();
        for (const token of tokens) {
            tokenSymbols.add(token.symbol);
            symbolMap.set(token.symbol, token);
            if (token.closeSymbol) {
                tokenSymbols.add(token.closeSymbol);
                symbolMap.set(token.closeSymbol, token);
            }
        }
        const delimiterSymbols = new Set<string>();
        const delimiterMap = new Map<string, ExpressionDelimiter>();
        for (const delimiter of delimiters) {
            if (delimiter.symbol.length > 1) {
                const symbol = delimiter.symbol.charAt(0).toUpperCase();
                delimiterSymbols.add(symbol);
                delimiterMap.set(symbol, delimiter)
            } else {
                delimiterSymbols.add(delimiter.symbol);
                delimiterMap.set(delimiter.symbol, delimiter);
            }
        }
        let tokenCount = 0;
        let currentToken = '';
        const result = [];
        let buffer = '';
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (tokenSymbols.has(c)) {
                buffer += c;
                if (currentToken === '') {
                    currentToken = c;
                } else if (currentToken !== c) {
                    const token = symbolMap.get(currentToken) as ExpressionToken;
                    if (!token.closeSymbol || token.closeSymbol !== c) {
                        continue;
                    }
                }
                const token = symbolMap.get(c) as ExpressionToken;
                if (token.escapable && i - 1 >= 0 && str[i - 1] === '\\') {
                    continue;
                }
                if (!token.closeSymbol) {
                    tokenCount = tokenCount === 1 ? 0 : 1;
                } else if (c === token.closeSymbol) {
                    tokenCount--;
                } else {
                    tokenCount++;
                }
                if (tokenCount === 0) {
                    currentToken = '';
                    if (token.delimiter) {
                        result.push(buffer.trim());
                        buffer = '';
                    }
                }
            } else {
                const delimiter = this.checkDelimiter(str, i, delimiterSymbols, delimiterMap);
                if (delimiter !== null && tokenCount === 0) {
                    if (buffer.trim().length > 0) {
                        result.push(buffer.trim());
                    }
                    buffer = '';
                    if ((delimiter as ExpressionDelimiter).include) {
                        result.push((delimiter as ExpressionDelimiter).symbol);
                        if ((delimiter as ExpressionDelimiter).symbol.length > 1) {
                            i += (delimiter as ExpressionDelimiter).symbol.length - 1;
                        }
                    }
                } else {
                    buffer += c;
                }
            }
        }
        if (buffer.trim().length > 0) {
            result.push(buffer.trim());
        }
        return result;
    }

    private checkDelimiter(str: string, i: number, delimiterSymbols: Set<string>, delimiters: Map<string, ExpressionDelimiter>): ExpressionDelimiter | null {
        const c = str[i].toUpperCase();
        if (delimiters.has(c)) {
            const delimiter = delimiters.get(c) as ExpressionDelimiter;
            if (delimiter.symbol.length === 1) {
                return delimiter;
            }
            if (delimiter.whitespace) {
                if (i >= 0 && !/\s/.test(str[i-1])) {
                    return null;
                }
            }
            if (i + delimiter.symbol.length < str.length) {
                if (str.slice(i, i + delimiter.symbol.length).toUpperCase() === delimiter.symbol) {
                    if (i + delimiter.symbol.length === str.length - 1) {
                        return null;
                    }
                    if (/\s/.test(str[i + delimiter.symbol.length])) {
                        return delimiter;
                    }
                }
            }
        }
        return null;
    }
}

export default BaseTokenParser;