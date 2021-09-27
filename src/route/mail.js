const express = require( 'express' );
const router = express.Router();
const fs = require( 'fs' );
const path = require( 'path' );
const common = require( '../utils/common' );
const rateLimit = require( "express-rate-limit" );
const apiLimiter = rateLimit( {
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: "Too many accounts created from this IP, please try again after an hour"
} );

router.post( '/addQueue', apiLimiter, async ( req, res ) => {
	console.log( 'addQueue' );

	const returnObj = {
		success: false,
		msg: '無動作'
	}
	const { senderName, mailAddress, phoneNum, companyName, content } = req.body;

	if ( !senderName || !mailAddress || !phoneNum || !companyName || !content ) {
		returnObj.msg = '欄位檢核失敗，必填欄位 {senderName, mailAddress, phoneNum, companyName, content}'
		res.json( returnObj )
		return;
	}

	const mailItem = { senderName, mailAddress, phoneNum, companyName, content };
	const queue = await common.getFile( 'queue' );
	const idx = common.getQueueLastIndex( queue );

	mailItem.index = idx + 1;
	mailItem.createTime = new Date().toLocaleString();

	queue.push( mailItem );

	fs.writeFileSync( path.resolve( __dirname, "../static/queue.json" ), JSON.stringify( queue ) );

	returnObj.success = true;
	returnObj.msg = '成功';

	res.json( returnObj )
} )

const Queue = require( 'bull' );
const sendMailQueue = new Queue( 'sendMail', {
	redis: {
		host: '127.0.0.1',
		port: 6379,
		// password: 'root'
	}
} );
let fakeIndex = 0;

router.post( '/addQueueTwo', apiLimiter, async ( req, res ) => {
	console.log( 'addQueueTwo call' );
	res.json( 'ok' )

	const options = {
		delay: 3000,
		attempts: 2
	};
	const mail = req.body;
	mail.index = fakeIndex;
	mail.createTime = new Date().toLocaleString();
	fakeIndex++;

	console.log( 'addQueueTwo add' );
	sendMailQueue.add( req.body, options );
} )

sendMailQueue.process( async job => {
	await common.sendMail( job.data );
	console.log( 'sleep' )
	sleep( 3000 );
	return;
} );

function fakeFun ( params ) {
	console.log( 'send', params.index );
}

function sleep ( milliseconds ) {
	var start = new Date().getTime();
	while ( 1 )
		if ( ( new Date().getTime() - start ) > milliseconds )
			break;
}

module.exports = router;