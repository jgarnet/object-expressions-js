import PathEvaluator from "./path-evaluator";
const get = require("lodash/get");

class BasePathEvaluator implements PathEvaluator {
    evaluate<T, R>(object: T, path: string): R {
        return get(object, path);
    }
}

export default BasePathEvaluator;