
const currencies = [
	'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB',
	'BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP',
	'DZD','EGP','ETB','EUR','FJD','GBP','GEL','GHS','GMD','GNF','GTQ','GYD','HKD','HNL','HTG','HUF','IDR','ILS',
	'INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD',
	'LSL','LYD','MAD','MDL','MGA','MKD','MMK','MOP','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR',
	'NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK',
	'SGD','SLL','SOS','SRD','SVC','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU',
	'UZS','VES','VND','XAF','XCD','XOF','XPF','YER','ZAR','ZMW'];

const runtimeOpts = {
	timeoutSeconds: 540,
	memory: '256MB'
}

module.exports = {
    currencies,
    runtimeOpts
}