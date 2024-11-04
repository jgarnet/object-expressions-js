import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";

const _size = require("lodash/size");

const size: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        let value = args[0];
        return _size(value);
    }
};

export default size;