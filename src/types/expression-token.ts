type ExpressionToken = {
    symbol: string,
    closeSymbol?: string,
    escapable?: boolean,
    delimiter?: boolean
};

export default ExpressionToken;