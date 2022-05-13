# Contributing
This's a simple Gmail sender implemented by Node JS and PM2. The purpose are using queue and multiple senders for high flow capacity.

# Quick Guide
* input your sender info at file below
```
src/config/accountConfig.json
```
* input your receiver info at file below
```
src/config/startup.js
```
* start by Docker
```
docker build . -t mailer
docker run -p 3002:3002 -d mailer
```
* start by PM2
```
pm2 start app.json
```
# Feature
1. Multiple senders to prevent single account invalid 
2. Prevent repeat requests by limiting IP access
3. Using queue to stabilize Gmail usage
4. Log system