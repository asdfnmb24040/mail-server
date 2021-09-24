const express = require( 'express' );
const router = express.Router();
const mailConfig = require( '../config/mailConfig' );
const nodemailer = require( 'nodemailer' );
const fs = require( 'fs' );
const path = require( 'path' );
const common = require( '../utils/common' );
const rateLimit = require( "express-rate-limit" );
const apiLimiter = rateLimit( {
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1,
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


module.exports = router;