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
    // uri: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-05-03&endtime=2018-05-04&latitude=19.40&longitude=-155.27&maxradiuskm=80',

    // The URL to get all records around Kilauea since May 3rd to the end of class, July 1st
    uri: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-05-03&endtime=2018-07-01&latitude=19.40&longitude=-155.27&maxradiuskm=80',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  };

  reqprom(options)
    .then(function(response) {
      const tremors = [];  // Array containing the list of properties for one earthquake/record
      let recordid = 0;    // Record number after filtering for 'Volcano'
      const magsize = [];  // Define and intialize the tremor magnitude size

      // Array containing first column and clearer label and it's setting of values
      const maglabel = [];
      maglabel[5] = 'greater than 5.00';
      for ( let i = 0; i <= 5; i++) {
        magsize[i] = 0; // Assign the 0-5 magsize array item to zero so ++ works
        if ( i !== 5 ) {
          maglabel[i] = i + ' - ' + i + '.99'; 
        }
      }
      // Loop through all the JSON records returned by the USGS API
      for ( let i = 0; i < response.features.length; i++ ) {
        // Get the title first and use to filter out the earthquakes not associated with the Volcano
        const title = response.features[i].properties.title;
        if ( title.match('Volcano')) {
          // console.log("Matched on Volcano");
          const mag = response.features[i].properties.mag;
          const time = new Date(response.features[i].properties.time);
          const long = response.features[i].geometry.coordinates[0];
          const latt = response.features[i].geometry.coordinates[1];
          // Add the new earthquake properties to the tremor array
          tremors.push({num: recordid++, title: title, mag: mag, time: time, long: long, latt: latt});
          // Make table for range
          if ( mag >= 5.0 ) {
            magsize[5]++;
          } else {
            magsize[Math.trunc(mag)]++ ;
          }
        }
      }
      // Sending the data to view/tremors.pug
      res.render('tremors', { magsize: magsize, maglabel: maglabel } );
    }
    )
    .catch(function(err) {
      // The API failed and report error
      console.log(err);
    });

  // res.render('index', { title: 'Express' });
});

module.exports = router;
