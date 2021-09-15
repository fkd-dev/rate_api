
//  Firestoreを使うため、廃止
// if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'rates') {
//     exports.rates	= require('./rates');
// }
// if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'test') {
//     exports.test		= require('./test');
// }
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'all_rates') {
    exports.all_rates	= require('./all_rates');
}
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'batch_30days_rates') {
    exports.batch_30days_rates	= require('./batch_30days_rates');
}
