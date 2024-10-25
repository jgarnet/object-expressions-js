import ExpressionFunction from "../types/expression-function";
import len from "./len";
import add from "./add";
import subtract from "./subtract";

const functions = new Map<string, ExpressionFunction>;
functions.set("LEN", len);
functions.set("ADD", add);
functions.set("SUBTRACT", subtract);

export default functions;