const express = require( 'express' );
const router = express.Router();
const common = require( '../utils/common' );
const rateLimit = require( "express-rate-limit" );
const config = require( '../config/startup' );
const apiLimiter = rateLimit( config.apiLimiter );
const Queue = require( 'bull' );
const sendMailQueue = new Queue( 'sendMail', {
	redis: config.redis
} );

let mailIndex = 0;

router.post( '/addQueue', apiLimiter, async ( req, res ) => {

	const returnObj = {
		success: true
	}
	const vaild = common.vaildMail( req.body );

	if ( !vaild ) {
		returnObj.success = false;
	}

	res.json( returnObj )

	if ( returnObj.success ) {
		const mail = req.body;
		mail.index = mailIndex;
		mail.createTime = new Date().toLocaleString();
		mailIndex++;

		console.log( 'Queue add' );

		const options = {
			// delay: 1000,
			attempts: 2
		};
		sendMailQueue.add( req.body, options );
	}
} )

router.get( '/testAccounts', apiLimiter, async ( req, res ) => {
	const accountsInfo = await common.getFile( 'accountConfig' );
	const auths = accountsInfo.auths;
	const info = accountsInfo.info;
	const result = [];
	const mailItem = { senderName: 'test', mailAddress: 'test', phoneNum: 'test', companyName: 'test', content: 'test', index: -1 }
	for ( let i in auths ) {
		const account = auths[ i ];
		const config = Object.assign( { auth: account }, info );
		const sendResult = await common.sendMail( mailItem, config );
		result.push( {
			item: account.user,
			testResult: sendResult
		} )

		console.log( 'test item => ', { item: account.user, sendResult } );
	}
	return res.json( result );
} )

router.post( '/addQueueTest', apiLimiter, async ( req, res ) => {
	console.log( 'addQueueTest call' );
	res.json( 'ok' )
	const limit = 100;
	const mail = req.body;

	while ( mailIndex < limit ) {
		mail.index = mailIndex;
		mail.createTime = new Date().toLocaleString();
		mailIndex++;

		const options = {
			delay: 1000,
			attempts: 2
		};
		sendMailQueue.add( Object.assign( {}, mail ), options );
		console.log( 'addQueueTwo add fakeIndex: ', mailIndex );
	}
} )

sendMailQueue.process( async job => {
	return await common.sendMailProcess( job.data );;
} );

console.log( `Mail Server Is Running` );


module.exports = router;