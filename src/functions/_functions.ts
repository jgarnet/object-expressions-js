import ExpressionFunction from "../types/expression-function";
import len from "./len";
import add from "./add";

const functions = new Map<string, ExpressionFunction>;
functions.set("LEN", len);
functions.set("ADD", add);

export default functions;