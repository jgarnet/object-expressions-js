import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";

const _size = require("lodash/size");

const size: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        let value = args[0];
        return _size(value);
    }
};

export default size;