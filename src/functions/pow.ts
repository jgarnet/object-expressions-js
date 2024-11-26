import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import ExpressionError from "../expression-error";
import {convertToNumber, requireNumber} from "../utils";

const pow: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (!args || args.length !== 2) {
            throw new ExpressionError(`POW() received invalid arguments in ${context.expression}`);
        }
        requireNumber(context, 'POW', ...args);
        return Math.pow(convertToNumber(args[0]), convertToNumber(args[1]));
    }
};

export default pow;