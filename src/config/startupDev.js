module.exports = {
	redis: {
		host: '127.0.0.1',
		port: 6050,
	},
	apiLimiter: {
		windowMs: 60 * 60 * 1000, // time
		max: 100,
		message: "Too many req from this IP, please try again after an day"
	},
	mail: {
		sleep: 2000,
	}
}