import FragmentParser from "./types/fragment-parser";
import ExpressionToken from "./types/expression-token";
import ExpressionDelimiter from "./types/expression-delimiter";

class BaseFragmentParser implements FragmentParser {
    parse(str: string, tokens: Set<ExpressionToken>, delimiters: Set<ExpressionDelimiter>): string[] {
        const tokenSymbols = new Set();
        const symbolMap = new Map();
        for (const token of tokens) {
            const symbol = token.symbol.charAt(0).toUpperCase();
            tokenSymbols.add(symbol);
            symbolMap.set(symbol, token);
            if (token.closeSymbol) {
                const closeSymbol = token.closeSymbol.charAt(0).toUpperCase();
                tokenSymbols.add(closeSymbol);
                symbolMap.set(closeSymbol, token);
            }
        }
        const delimiterMap = new Map<string, ExpressionDelimiter>();
        for (const delimiter of delimiters) {
            delimiterMap.set(delimiter.symbol.charAt(0).toUpperCase(), delimiter);
        }
        let tokenCount = 0;
        let currentToken = '';
        const result = [];
        let buffer = '';
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (tokenSymbols.has(c)) {
                const token = symbolMap.get(c) as ExpressionToken;
                const isStart = this.isTokenSymbol(str, i, token.symbol);
                const isClose = token.closeSymbol ? this.isTokenSymbol(str, i, token.closeSymbol) : false;
                if (!isStart && !isClose) {
                    buffer += c;
                    continue;
                }
                // append symbol to buffer
                const originalIndex = i;
                const symbol = isStart ? token.symbol : token.closeSymbol as string;
                buffer += str.slice(i, Math.max(i + symbol.length, 1));
                // adjust index to account for remaining symbol characters
                i += symbol.length - 1;
                if (currentToken === '') {
                    // keep track of current token
                    currentToken = c;
                } else if (currentToken !== c) {
                    // determine if current character is the start of the closeSymbol for the current token
                    const _token = symbolMap.get(currentToken) as ExpressionToken;
                    if (!_token.closeSymbol || !this.isTokenSymbol(str, originalIndex, _token.closeSymbol)) {
                        continue;
                    }
                }
                if (token.escapable && originalIndex - 1 >= 0 && str[originalIndex - 1] === '\\') {
                    continue;
                }
                if (!token.closeSymbol) {
                    tokenCount = tokenCount === 1 ? 0 : 1;
                } else if (this.isTokenSymbol(str, originalIndex, token.closeSymbol)) {
                    tokenCount--;
                } else {
                    tokenCount++;
                }
                if (tokenCount < 0) {
                    throw new SyntaxError(`Expression contains imbalanced symbol: ${currentToken}`);
                }
                if (tokenCount === 0) {
                    currentToken = '';
                    if (token.break) {
                        result.push(buffer.trim());
                        buffer = '';
                    }
                }
            } else {
                const delimiter = this.checkDelimiter(str, i, delimiterMap);
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
        if (tokenCount !== 0) {
            throw new SyntaxError(`Expression contains imbalanced symbol: ${currentToken}`);
        }
        return result;
    }

    private checkDelimiter(str: string, i: number, delimiters: Map<string, ExpressionDelimiter>): ExpressionDelimiter | null {
        const c = str[i].toUpperCase();
        if (delimiters.has(c)) {
            const delimiter = delimiters.get(c) as ExpressionDelimiter;
            if (delimiter.symbol.length === 1) {
                return delimiter;
            }
            if (delimiter.whitespace) {
                if (i - 1 >= 0 && !/\s/.test(str[i - 1])) {
                    return null;
                }
            }
            if (i + delimiter.symbol.length - 1 < str.length) {
                if (str.slice(i, i + delimiter.symbol.length).toUpperCase() === delimiter.symbol) {
                    if (i + delimiter.symbol.length - 1 === str.length - 1 || /\s/.test(str[i + delimiter.symbol.length])) {
                        return delimiter;
                    }
                }
            }
        }
        return null;
    }

    private isTokenSymbol(str: string, i: number, symbol: string): boolean {
        if (i + symbol.length - 1 > str.length - 1) {
            return false;
        }
        return str.slice(i, i + symbol.length) === symbol;
    }
}

export default BaseFragmentParser;