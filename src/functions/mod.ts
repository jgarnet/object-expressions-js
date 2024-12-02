import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {convertToNumber, requireNumber} from "../utils";
import ExpressionError from "../expression-error";

const mod: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (args.length !== 2) {
            throw new ExpressionError('MOD() requires two numeric arguments');
        }
        requireNumber(context, 'MOD', args[0], args[1]);
        const a = convertToNumber(args[0]);
        const b = convertToNumber(args[1]);
        if (b === 0) {
            throw new ExpressionError('MOD(): cannot divide by zero');
        }
        return a % b;
    }
};

export default mod;