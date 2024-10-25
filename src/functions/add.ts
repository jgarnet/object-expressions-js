import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {getValue} from "./_utils";

const add: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        if (args.length < 2) {
            throw new SyntaxError(`SyntaxError: ADD() received invalid arguments in ${context.expression}`);
        }
        let result = getValue('ADD', args[0], context);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            result += getValue('ADD', arg, context);
        }
        return result;
    }
};

export default add;