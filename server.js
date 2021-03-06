'use strict'

const express = require('express');
const GenerateStats = require('./modules-local/generate-stats');
var   schedule = require('node-schedule');
const config = {
  products: ['Core', 'External Software Affecting Firefox',
             'Firefox', 'Firefox for iOS', 'Firefox for Android',
             'DevTools', 'NSPR', 'NSS', 'WebExtensions', 'Toolkit'],
  exclude: ['build conf', 'ca cert'], // components to exclude, can be partial strings
  versions: [
    {number: 62, mergedate: '2018-05-07', betadate: '2018-06-26'},
    {number: 63, mergedate: '2018-06-25', betadate: '2018-09-04'},
    {number: 64, mergedate: '2018-09-04', betadate: '2018-10-23'}
  ]
};
var   data = {stats: false, message: 'not ready, please refetch'};

// Method to periodically run to generate stats

function update() {
  var myStats = new GenerateStats(config);

  myStats.then(stats => {
    console.log(stats.report);
    data = { message: 'ok', nextUpdate: j.nextInvocation(), lastUpdate: new Date(), stats: stats};
  });
}

// update at midnight
var rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;

var j = schedule.scheduleJob(rule, update);

// get first set of data
update();

var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/data", function (request, response) {
  response.send(data);
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 8080, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
