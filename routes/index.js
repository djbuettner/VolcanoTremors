'use strict';

// Using week-03 problem as a framework, set up request/promise and express
const express = require('express');
const router = express.Router();
const reqprom = require('request-promise-native');

/* GET home page. */
router.get('/', function(req, res) {

  // Set up the header parameters for the usgs.gov request for earthquake data
  const options = {
    // Initially, the usgs.gov api gets one day that is used for development
    uri: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-05-03&endtime=2018-05-04&latitude=19.40&longitude=-155.27&maxradiuskm=80',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  };

  reqprom(options)
    .then(function(response) {
      // Created the view 'json.pug' and sending request to render the GitHub API
      // res.render('json', {json: response.features}); // Testing render & json.pug

      // Getting the specific fields from the first record to establish access to data
      /* Testing section to get fields
      const title = response.features[0].properties.title;
      const mag = response.features[0].properties.mag;
      const time = new Date(response.features[0].properties.time);
      const long = response.features[0].geometry.coordinates[0];
      const latt = response.features[0].geometry.coordinates[1];
      console.log(response.features.length);
      */

      let tremors = [];
      for ( let i = 0; i < response.features.length; i++ ) {
        const title = response.features[i].properties.title;
        const mag = response.features[i].properties.mag;
        const time = new Date(response.features[i].properties.time);
        const long = response.features[i].geometry.coordinates[0];
        const latt = response.features[i].geometry.coordinates[1];
        tremors.push({num: i, title: title, mag: mag, time: time, long: long, latt: latt})
      };
      // res.render("json",tremors);
      res.send(tremors);

      // res.send({title: title, mag: mag, time: time, long: long, latt: latt} ); // Test I see data
      // res.render("json", {json: {title: title, mag: mag, time: time, long: long, latt: latt} })

      // res.send(JSON.stringify( {mag: feat.mag, long: long, latt: latt} ));
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
