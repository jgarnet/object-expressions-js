import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";
const some = require("lodash/some");

const _in: Operator = {
    evaluate<T>(value: any, target: string, context: ExpressionContext<T>): boolean {
        const values = target.split(',').map(val => val.trim());
        return some(values, (val: any) => val == value);
    }
};

export default _in;