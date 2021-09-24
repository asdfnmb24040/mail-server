const express = require( 'express' );
const router = express.Router();
const mailConfig = require( '../config/mailConfig' );
const nodemailer = require( 'nodemailer' );
const fs = require( 'fs' );
const path = require( 'path' );
const common = require( '../utils/common' );

router.get( '/', ( req, res ) => {
	res.send( 'Hello mail!' )
} )

router.post( '/addQueue', async ( req, res ) => {
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

router.post( '/', ( req, res ) => {
	console.log( '收到req', JSON.stringify( req.body ) );

	const returnObj = {
		success: false,
		msg: '無動作'
	}

	try {
		const { senderName, mailAddress, phoneNum, companyName, content } = req.body;

		if ( !senderName || !mailAddress || !phoneNum || !companyName || !content ) {
			returnObj.msg = '欄位檢核失敗，必填欄位 {senderName, mailAddress, phoneNum, companyName, content}'
			res.json( returnObj )
		}

		const transporter = nodemailer.createTransport( mailConfig );
		const mail = {
			to: 'armanddeng@future.net.co',
			subject: 'sigma展覽訊息信件' + randomNum( 1000, 9999 ),
			html:
				`
				<div>${senderName}<div/><br>
				<div>${mailAddress}<div/><br>
				<div>${phoneNum}<div/><br>
				<div>${companyName}<div/><br>
				<div>${content}<div/><br>
			`
		};

		transporter.sendMail( mail, ( error, info ) => {
			if ( error ) {
				console.log( '錯誤:' );
				console.log( error );
				returnObj.msg = '寄信時發生錯誤'
				res.json( returnObj )
			} else {
				console.log( '信件已發送:' );
				console.log( JSON.stringify( mail ) );
				console.log( info.response );

				returnObj.success = true;
				returnObj.msg = '信件已發送'

				res.json( returnObj )
			}
		} );

	} catch ( error ) {
		returnObj.msg = JSON.stringify( error )
		res.json( returnObj )
	}

} )

router.post( '/test', async ( req, res ) => {

	const returnObj = {
		success: false,
		msg: '無動作'
	}

	console.log( '收到req', JSON.stringify( req.body ) );

	for ( let i = 0; i < 100; i++ ) {
		console.log( 'count =>', i );


		try {
			const { senderName, mailAddress, phoneNum, companyName, content } = req.body;

			if ( !senderName || !mailAddress || !phoneNum || !companyName || !content ) {
				returnObj.msg = '欄位檢核失敗，必填欄位 {senderName, mailAddress, phoneNum, companyName, content}'
			}

			const transporter = nodemailer.createTransport( mailConfig );
			const mail = {
				to: 'armanddeng@future.net.co',
				subject: 'sigma展覽訊息信件' + randomNum( 1, 999 ),
				html:
					`
							<div>${senderName}<div/><br>
							<div>${mailAddress}<div/><br>
							<div>${phoneNum}<div/><br>
							<div>${companyName}<div/><br>
							<div>${content}<div/><br>
						`
			};

			transporter.sendMail( mail, ( error, info ) => {
				if ( error ) {
					console.log( '錯誤:' );
					console.log( error );
				} else {
					console.log( '信件已發送:' );
					console.log( JSON.stringify( mail ) );
					console.log( info.response );

					returnObj.success = true;
				}
			} );

		} catch ( error ) {
			console.log( error )
		}

		await new Promise( ( resolve, reject ) => setTimeout( resolve, 1000 ) );
	}
} )

router.post( '/queue', ( req, res ) => {
	console.log( '收到req', JSON.stringify( req.body ) );

	const returnObj = {
		success: false,
		msg: '無動作'
	}

	try {
		const { senderName, mailAddress, phoneNum, companyName, content } = req.body;

		if ( !senderName || !mailAddress || !phoneNum || !companyName || !content ) {
			returnObj.msg = '欄位檢核失敗，必填欄位 {senderName, mailAddress, phoneNum, companyName, content}'
			res.json( returnObj )
		}

		const transporter = nodemailer.createTransport( mailConfig );
		const mail = {
			to: 'armanddeng@future.net.co',
			subject: 'sigma展覽訊息信件' + randomNum( 1, 999 ),
			html:
				`
				<div>${senderName}<div/><br>
				<div>${mailAddress}<div/><br>
				<div>${phoneNum}<div/><br>
				<div>${companyName}<div/><br>
				<div>${content}<div/><br>
			`
		};

		transporter.sendMail( mail, ( error, info ) => {
			if ( error ) {
				console.log( '錯誤:' );
				console.log( error );
				returnObj.msg = '寄信時發生錯誤'
				res.json( returnObj )
			} else {
				console.log( '信件已發送:' );
				console.log( JSON.stringify( mail ) );
				console.log( info.response );

				returnObj.success = true;
				returnObj.msg = '信件已發送'

				res.json( returnObj )
			}
		} );

	} catch ( error ) {
		returnObj.msg = JSON.stringify( error )
		res.json( returnObj )
	}

} )

function randomNum ( minNum, maxNum ) {
	switch ( arguments.length ) {
		case 1:
			return parseInt( Math.random() * minNum + 1, 10 );
			break;
		case 2:
			return parseInt( Math.random() * ( maxNum - minNum + 1 ) + minNum, 10 );
			break;
		default:
			return 0;
			break;
	}
}

module.exports = router;