import TokenParser, {TokenParserOptions} from "./token-parser";
import SymbolToken from "../symbol-token";
import DelimiterToken from "../delimiter-token";

class BaseTokenParser implements TokenParser {
    parse(str: string, tokens: Set<SymbolToken>, delimiters: Set<DelimiterToken>, options?: TokenParserOptions): string[] {
        const tokenMap = this.mapTokens(tokens);
        const delimiterMap = this.mapDelimiters(delimiters);
        let tokenCount = 0;
        let currentSymbol = '';
        const result = [];
        let buffer = '';
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (tokenMap.has(c)) {
                // check if the current character is the start of a token symbol / closeSymbol
                const _tokens = tokenMap.get(c) as SymbolToken[];
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
                        break;
                    }
                }
                if (!isStart && !isClose) {
                    // this is not a token symbol -- append to buffer and continue
                    buffer += c;
                    continue;
                }
                token = token as SymbolToken;
                // this is a token symbol; append symbol to buffer
                const originalIndex = i;
                const symbol = isStart ? token.symbol : token.closeSymbol as string;
                buffer += str.slice(i, Math.max(i + symbol.length, 1));
                // adjust index to account for remaining symbol characters
                i += symbol.length - 1;
                if (token.escapable && originalIndex - 1 >= 0 && str[originalIndex - 1] === '\\') {
                    // ignore escaped symbols only if currentSymbol matches
                    if (currentSymbol === token.symbol || token.closeSymbol && currentSymbol === token.closeSymbol) {
                        continue;
                    }
                }
                if (currentSymbol === '') {
                    // keep track of current token symbol
                    currentSymbol = symbol;
                } else if (currentSymbol !== symbol) {
                    // determine if current character is the start of the closeSymbol for the current token
                    const _token = tokenMap.get(currentSymbol) as SymbolToken[];
                    if (!_token[0].closeSymbol || !this.isTokenSymbol(str, originalIndex, _token[0].closeSymbol)) {
                        // this indicates we are inside another token / group; simply append to buffer and continue
                        continue;
                    }
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
                    currentSymbol = '';
                    if (token.break) {
                        result.push(buffer.trim());
                        buffer = '';
                    }
                }
            } else {
                let delimiter = this.checkDelimiter(str, i, delimiterMap);
                if (delimiter !== null && tokenCount === 0) {
                    delimiter = delimiter as DelimiterToken;
                    // split values based on delimiter if we are not inside a token / group
                    this.addToken(result, buffer, options);
                    buffer = '';
                    if (delimiter.include) {
                        result.push(delimiter.symbol);
                        if (delimiter.symbol.length > 1) {
                            i += delimiter.symbol.length - 1;
                        }
                    }
                } else {
                    // neither a token group nor a delimiter; append character to buffer
                    buffer += c;
                }
            }
        }
        this.addToken(result, buffer, options);
        if (tokenCount !== 0) {
            const token = tokenMap.get(currentSymbol) as SymbolToken[];
            if (token[0].closeSymbol) {
                throw new SyntaxError(`Expression contains imbalanced symbol group: ${token[0].symbol}${token[0].closeSymbol}`);
            }
            throw new SyntaxError(`Expression contains imbalanced symbol: ${token[0].symbol}`);
        }
        return result;
    }

    private addToken(results: string[], token: string, options?: TokenParserOptions): void {
        if (token.trim().length > 0 || options?.allowEmpty) {
            // append remaining buffer to results
            results.push(token.trim());
        }
    }

    private mapTokens(tokens: Set<SymbolToken>): Map<string, SymbolToken[]> {
        const map = new Map<string, SymbolToken[]>;
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

    private registerToken(map: Map<string, SymbolToken[]>, symbol: string, token: SymbolToken): void {
        if (map.has(symbol)) {
            const values = map.get(symbol) as SymbolToken[];
            values.push(token);
        } else {
            map.set(symbol, [token]);
        }
    }

    private mapDelimiters(delimiters: Set<DelimiterToken>): Map<string, DelimiterToken[]> {
        const map = new Map<string, DelimiterToken[]>;
        for (const delimiter of delimiters) {
            const symbol = delimiter.symbol.charAt(0).toUpperCase();
            if (map.has(symbol)) {
                const values = map.get(symbol) as DelimiterToken[];
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
     * Determines if the current character is a delimiter, and returns {@link DelimiterToken} if so.
     * @param str The token string.
     * @param i The current index in the token string.
     * @param delimiters Map containing all {@link DelimiterToken} values.
     * @private
     */
    private checkDelimiter(str: string, i: number, delimiters: Map<string, DelimiterToken[]>): DelimiterToken | null {
        const c = str[i].toUpperCase();
        if (delimiters.has(c)) {
            const _delimiters = delimiters.get(c) as DelimiterToken[];
            for (const delimiter of _delimiters) {
                if (delimiter.whitespace) {
                    if (i - 1 >= 0 && !/\s/.test(str[i - 1])) {
                        continue;
                    }
                }
                if (delimiter.symbol.length === 1) {
                    return delimiter;
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

export default BaseTokenParser;