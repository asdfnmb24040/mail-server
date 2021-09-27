const express = require( 'express' );
const bodyParser = require( 'body-parser' )
const cors = require( 'cors' );
const mail = require( './route/mail' );
const mailService = require( './service/mailService' )
const app = express();
const port = 3002;
const corsOptions = {
	origin: [
		'http://localhost:3000',
		'http://localhost:3001',
	],
	credentials: true,
	allowedHeaders: [ 'Content-Type', 'Authorization' ],
};

app.listen( port, () => {
	console.log( `app listening at http://localhost:${port}` )
} )
app.use( cors( corsOptions ) );
app.use( bodyParser.json() )
app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( '/mail', mail );
