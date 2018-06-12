'use strict';

const express = require('express');
const router = express.Router();

// Get week-02 modules with fs being for testing.
// const fs = require('fs'); // Used for initial testing
// Require the request-promise-native package, but renamed to reqprom
const reqprom = require('request-promise-native');

/* GET home page. */
router.get('/', function(req, res) {

  // Get week-02 request to GitHub api
  const options = {
    // TODO: Create an object literal to hit your account on the GitHub API,
    // and pass any other information the API requires (you should not have
    // to authenticate for this, however)
    uri: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-05-03&endtime=2018-05-04&latitude=19.40&longitude=-155.27&maxradiuskm=80',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  };

  reqprom(options)
    .then(function(response) {
      // TODO: Handle the returned JSON data and write it to a file called
      // `response.json` in your `week-two/` directory

      // Created the view 'json.pug' and sending request to render the GitHub API
      // res.render('json', {json: response.features});
      // res.send(JSON.stringify(response.features));
      // const feat = response.features[0].properties;
      const title = response.features[0].properties.title;
      const mag = response.features[0].properties.mag;
      const time = new Date(response.features[0].properties.time);
      const long = response.features[0].geometry.coordinates[0];
      const latt = response.features[0].geometry.coordinates[1];
      // res.send({mag: feat.mag, long: long, latt: latt});
      // res.send(JSON.stringify( {mag: feat.mag, long: long, latt: latt} ));
      res.send({title: title, mag: mag, time: time, long: long, latt: latt} );
      // res.send(response);
      // res.render('json', response);
    }
    )
    .catch(function(err) {
      // The API failed and report error
      console.log(err);
    });

  // res.render('index', { title: 'Express' });
});

module.exports = router;
