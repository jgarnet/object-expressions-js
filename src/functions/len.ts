import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {getField} from "./_utils";

const len: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        let value = args[0];
        if (value[0] === '"' && value[value.length - 1] === '"') {
            value = value.slice(1, value.length - 1);
        } else {
            value = getField(context.object, value);
        }
        return `${value ?? ''}`.length;
    }
};

export default len;