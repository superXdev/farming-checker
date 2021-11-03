require('dotenv').config()
const Web3 = require('web3');
const chalk = require('chalk');
const CoinGecko = require('coingecko-api');
const posiABI = require('./abi/posi.json');
const hurricaneABI = require('./abi/hurricane.json');

const env = process.env;
const log = console.log;
const CoinGeckoClient = new CoinGecko();
const formatter = new Intl.NumberFormat('en-US');
const web3 = new Web3('https://bsc-dataseed4.defibit.io/');
const aWeb3 = new Web3('https://api.avax.network/ext/bc/C/rpc');

(async function() {
	const hurricane = new aWeb3.eth.Contract(hurricaneABI, env.HURRICANE_CONTRACT_ADDRESS)

	const hurricaneEarn = await hurricane.methods.pending(18, env.HURRICANE_ADDRESS).call()
	const hurricanePrice = await getHurricanePrice()
	const posiPrice = await getPosiPrice()

	log("====================================")
	log(`|| ${chalk.green("Position.exchange")}`)
	log("====================================")
	log(`Price POSI : ${formatter.format(posiPrice.idr)} IDR (${changePrice(posiPrice.idr_24h_change)})`)
	await showTotalEarnPosi(env.POSI_ADDRESS, posiPrice.idr)

	log("\n====================================")
	log(`|| ${chalk.magenta('HurricaneSwap')}`)
	log("====================================")
	log(`Price HCT  : ${formatter.format(hurricanePrice.idr)} IDR (${changePrice(hurricanePrice.idr_24h_change)})`)
	log('------------------------------------')
	log(`Total Earn : ${chalk.yellow(fromWei(hurricaneEarn[0]))} HCT (Rp.${totalIdr(hurricaneEarn[0], hurricanePrice.idr)})`)
})();

function fromWei(amount) {
	return web3.utils.fromWei(amount).slice(0, 5);
}

async function getPosiPrice() {
	let price = await CoinGeckoClient.simple.price({
	    ids: 'position-token',
	    vs_currencies: 'idr',
	    include_24hr_change: true
	});
	return price.data['position-token'];
}

async function getHurricanePrice() {
	let price = await CoinGeckoClient.simple.price({
	    ids: 'hurricaneswap-token',
	    vs_currencies: 'idr',
	    include_24hr_change: true
	});
	return price.data['hurricaneswap-token'];
}

function totalIdr(balance, price) {
	return formatter.format(
		(price) ? Math.round(parseFloat(fromWei(balance))*price) : Math.round(parseFloat(fromWei(balance)))
	);
}

async function showTotalEarnPosi(acc, posiPrice) {
	let posiEarn = ""
	const accounts = acc.split("|")
	const posi = new web3.eth.Contract(posiABI, env.POSI_CONTRACT_ADDRESS)

	if(accounts.length > 1) {
		for(let address of accounts) {
			posiEarn = await posi.methods.pendingPosition(0, address).call()

			log('------------------------------------')
			log(`Address    : ${address.substring(0,12)}....${address.substring(36,42)}`)
			log(`Total Earn : ${chalk.yellow(fromWei(posiEarn))} POSI (Rp.${totalIdr(posiEarn, posiPrice)})`)
		}
	} else {
		posiEarn = await posi.methods.pendingPosition(0, env.POSI_ADDRESS).call()

		log(`Total Earn : ${chalk.yellow(fromWei(posiEarn))} POSI (Rp.${totalIdr(posiEarn, posiPrice)})`)
	}
}

function changePrice(price) {
	price = Math.round(price)

	return (price < 0) ? chalk.red(price+'%') : chalk.green(price+'%')
}