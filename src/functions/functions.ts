import ExpressionFunction from "./expression-function";
import len from "./len/len";
import add from "./add/add";
import subtract from "./subtract/subtract";
import multiply from "./multiply/multiply";
import divide from "./divide/divide";
import size from "./size/size";
import pow from "./pow/pow";
import upper from "./upper/upper";
import lower from "./lower/lower";
import filter from "./filter/filter";
import exists from "./exists/exists";
import get from "./get/get";
import last from "./last/last";
import dateCompare from "./date-compare/date-compare";
import max from "./max/max";
import min from "./min/min";
import dateInterval from "./date-interval/date-interval";
import mod from "./mod/mod";

const functions = new Map<string, ExpressionFunction>;

functions.set("ADD", add);
functions.set("DATECOMP", dateCompare);
functions.set("DATEIVL", dateInterval);
functions.set("DIVIDE", divide);
functions.set("EXISTS", exists);
functions.set("FILTER", filter);
functions.set("GET", get);
functions.set("LAST", last);
functions.set("LEN", len);
functions.set("LOWER", lower);
functions.set("MAX", max);
functions.set("MIN", min);
functions.set("MOD", mod);
functions.set("MULTIPLY", multiply);
functions.set("POW", pow);
functions.set("SIZE", size);
functions.set("SUBTRACT", subtract);
functions.set("UPPER", upper);

export default functions;