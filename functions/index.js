
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'rates') {
    exports.rates	= require('./rates');
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'test') {
    exports.test		= require('./test');
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'test2') {
    exports.test2	= require('./test2');
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'all_rates') {
    exports.all_rates	= require('./all_rates');
}
