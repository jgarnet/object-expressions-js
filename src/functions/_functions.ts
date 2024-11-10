import ExpressionFunction from "../types/expression-function";
import len from "./len";
import add from "./add";
import subtract from "./subtract";
import multiply from "./multiply";
import divide from "./divide";
import size from "./size";
import pow from "./pow";
import upper from "./upper";
import lower from "./lower";
import filter from "./filter";
import exists from "./exists";
import get from "./get";
import last from "./last";
import compareDates from "./compare-dates";

const functions = new Map<string, ExpressionFunction>;

functions.set("ADD", add);
functions.set("COMP_DT", compareDates);
functions.set("DIVIDE", divide);
functions.set("EXISTS", exists);
functions.set("FILTER", filter);
functions.set("GET", get);
functions.set("LAST", last);
functions.set("LEN", len);
functions.set("LOWER", lower);
functions.set("MULTIPLY", multiply);
functions.set("POW", pow);
functions.set("SIZE", size);
functions.set("SUBTRACT", subtract);
functions.set("UPPER", upper);

export default functions;