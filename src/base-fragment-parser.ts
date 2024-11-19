import FragmentParser from "./types/fragment-parser";
import ExpressionToken from "./types/expression-token";
import ExpressionDelimiter from "./types/expression-delimiter";

class BaseFragmentParser implements FragmentParser {
    parse(str: string, tokens: Set<ExpressionToken>, delimiters: Set<ExpressionDelimiter>): string[] {
        const tokenMap = this.mapTokens(tokens);
        const delimiterMap = this.mapDelimiters(delimiters);
        let tokenCount = 0;
        let currentToken = '';
        const result = [];
        let buffer = '';
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (tokenMap.has(c)) {
                // check if the current character is the start of a token symbol / closeSymbol
                const token = tokenMap.get(c) as ExpressionToken;
                const isStart = this.isTokenSymbol(str, i, token.symbol);
                const isClose = token.closeSymbol ? this.isTokenSymbol(str, i, token.closeSymbol) : false;
                if (!isStart && !isClose) {
                    // this is not a token symbol -- append to buffer and continue
                    buffer += c;
                    continue;
                }
                // this is a token symbol; append symbol to buffer
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
                    const _token = tokenMap.get(currentToken) as ExpressionToken;
                    if (!_token.closeSymbol || !this.isTokenSymbol(str, originalIndex, _token.closeSymbol)) {
                        // this indicates we are inside another token / group; simply append to buffer and continue
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
                    if (token.closeSymbol) {
                        throw new SyntaxError(`Expression contains imbalanced symbol group: ${token.symbol}${token.closeSymbol}`);
                    }
                    throw new SyntaxError(`Expression contains imbalanced symbol: ${symbol}`);
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
                    // split values based on delimiter if we are not inside a token / group
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
            // append remaining buffer to results
            result.push(buffer.trim());
        }
        if (tokenCount !== 0) {
            const token = tokenMap.get(currentToken) as ExpressionToken;
            if (token.closeSymbol) {
                throw new SyntaxError(`Expression contains imbalanced symbol group: ${token.symbol}${token.closeSymbol}`);
            }
            throw new SyntaxError(`Expression contains imbalanced symbol: ${token.symbol}`);
        }
        return result;
    }

    private mapTokens(tokens: Set<ExpressionToken>): Map<string, ExpressionToken> {
        const map = new Map<string, ExpressionToken>;
        for (const token of tokens) {
            const symbol = token.symbol.charAt(0).toUpperCase();
            map.set(symbol, token);
            if (token.closeSymbol) {
                const closeSymbol = token.closeSymbol.charAt(0).toUpperCase();
                map.set(closeSymbol, token);
            }
        }
        return map;
    }

    private mapDelimiters(delimiters: Set<ExpressionDelimiter>): Map<string, ExpressionDelimiter> {
        const map = new Map<string, ExpressionDelimiter>;
        for (const delimiter of delimiters) {
            map.set(delimiter.symbol.charAt(0).toUpperCase(), delimiter);
        }
        return map;
    }

    /**
     * Determines if the current character is a delimiter, and returns {@link ExpressionDelimiter} if so.
     * @param str The fragment string.
     * @param i The current index in the fragment string.
     * @param delimiters Map containing all {@link ExpressionDelimiter} values.
     * @private
     */
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