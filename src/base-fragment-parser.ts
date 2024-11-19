import FragmentParser from "./types/fragment-parser";
import ExpressionToken from "./types/expression-token";
import ExpressionDelimiter from "./types/expression-delimiter";

class BaseFragmentParser implements FragmentParser {
    parse(str: string, tokens: Set<ExpressionToken>, delimiters: Set<ExpressionDelimiter>): string[] {
        const tokenMap = this.mapTokens(tokens);
        const delimiterMap = this.mapDelimiters(delimiters);
        let tokenCount = 0;
        let currentToken = '';
        let currentSymbol = '';
        const result = [];
        let buffer = '';
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (tokenMap.has(c)) {
                // check if the current character is the start of a token symbol / closeSymbol
                const _tokens = tokenMap.get(c) as ExpressionToken[];
                let token = undefined;
                let isStart = false;
                let isClose = false;
                for (const _token of _tokens) {
                    if (this.isTokenSymbol(str, i, _token.symbol)) {
                        token = _token;
                        isStart = true;
                        break;
                    } else if (_token.closeSymbol && this.isTokenSymbol(str, i, _token.closeSymbol)) {
                        token = _token;
                        isClose = true;
                    }
                }
                if (!isStart && !isClose) {
                    // this is not a token symbol -- append to buffer and continue
                    buffer += c;
                    continue;
                }
                token = token as ExpressionToken;
                // this is a token symbol; append symbol to buffer
                const originalIndex = i;
                const symbol = isStart ? token.symbol : token.closeSymbol as string;
                buffer += str.slice(i, Math.max(i + symbol.length, 1));
                // adjust index to account for remaining symbol characters
                i += symbol.length - 1;
                if (currentToken === '') {
                    // keep track of current token
                    currentToken = c;
                    currentSymbol = symbol;
                } else if (currentSymbol !== symbol) {
                    // determine if current character is the start of the closeSymbol for the current token
                    const _token = tokenMap.get(currentSymbol) as ExpressionToken[];
                    if (!_token[0].closeSymbol || !this.isTokenSymbol(str, originalIndex, _token[0].closeSymbol)) {
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
            const token = tokenMap.get(currentSymbol) as ExpressionToken[];
            if (token[0].closeSymbol) {
                throw new SyntaxError(`Expression contains imbalanced symbol group: ${token[0].symbol}${token[0].closeSymbol}`);
            }
            throw new SyntaxError(`Expression contains imbalanced symbol: ${token[0].symbol}`);
        }
        return result;
    }

    private mapTokens(tokens: Set<ExpressionToken>): Map<string, ExpressionToken[]> {
        const map = new Map<string, ExpressionToken[]>;
        for (const token of tokens) {
            const symbol = token.symbol.charAt(0).toUpperCase();
            this.registerToken(map, symbol, token);
            this.registerToken(map, token.symbol, token);
            if (token.closeSymbol) {
                const closeSymbol = token.closeSymbol.charAt(0).toUpperCase();
                this.registerToken(map, closeSymbol, token);
                this.registerToken(map, token.closeSymbol, token);
            }
        }
        for (const value of map.values()) {
            this.sortPrecedence(value);
        }
        return map;
    }

    private registerToken(map: Map<string, ExpressionToken[]>, symbol: string, token: ExpressionToken): void {
        if (map.has(symbol)) {
            const values = map.get(symbol) as ExpressionToken[];
            values.push(token);
        } else {
            map.set(symbol, [token]);
        }
    }

    private mapDelimiters(delimiters: Set<ExpressionDelimiter>): Map<string, ExpressionDelimiter[]> {
        const map = new Map<string, ExpressionDelimiter[]>;
        for (const delimiter of delimiters) {
            const symbol = delimiter.symbol.charAt(0).toUpperCase();
            if (map.has(symbol)) {
                const values = map.get(symbol) as ExpressionDelimiter[];
                values.push(delimiter);
            } else {
                map.set(symbol, [delimiter]);
            }
        }
        for (const value of map.values()) {
            this.sortPrecedence(value);
        }
        return map;
    }

    private sortPrecedence(values: any[]): void {
        values.sort((a, b) => {
            if (a.precedence > b.precedence) {
                // higher precedence should be prioritized
                return -1;
            } else if (a.precedence < b.precedence) {
                return 1;
            }
            return 0;
        });
    }

    /**
     * Determines if the current character is a delimiter, and returns {@link ExpressionDelimiter} if so.
     * @param str The fragment string.
     * @param i The current index in the fragment string.
     * @param delimiters Map containing all {@link ExpressionDelimiter} values.
     * @private
     */
    private checkDelimiter(str: string, i: number, delimiters: Map<string, ExpressionDelimiter[]>): ExpressionDelimiter | null {
        const c = str[i].toUpperCase();
        if (delimiters.has(c)) {
            const _delimiters = delimiters.get(c) as ExpressionDelimiter[];
            for (const delimiter of _delimiters) {
                if (delimiter.symbol.length === 1) {
                    return delimiter;
                }
                if (delimiter.whitespace) {
                    if (i - 1 >= 0 && !/\s/.test(str[i - 1])) {
                        continue;
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