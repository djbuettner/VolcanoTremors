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
      for ( let i = 0; i <= 5; i++) {
        magsize[i] = 0; // Assign the 0-5 magsize array item to zero so ++ works
        if ( i !== 5 ) {
          maglabel[i] = `${ i } - ${ i }.99`; 
        }
        else {
          maglabel[5] = 'greater than 5.00';
        }
      }
      // Loop through all the JSON records returned by the USGS API
      for ( let i = 0; i < response.features.length; i++ ) {
        // Declare the needed variables
        let title, mag, time, lngtd, latt;
        // Get the title first and use to filter out the earthquakes not associated with the Volcano
        // const title = response.features[i].properties.title;
        title = response.features[i].properties.title;
        if ( title.match('Volcano')) {
          mag = response.features[i].properties.mag;
          time = new Date(response.features[i].properties.time);
          lngtd = response.features[i].geometry.coordinates[0];
          latt = response.features[i].geometry.coordinates[1];
          // Add the new earthquake properties to the tremor array
          tremors.push({num: recordid++, title: title, mag: mag, time: time, lngtd: lngtd, latt: latt});
          // Make table for range
          if ( mag >= 5.0 ) {
            magsize[5]++;
          } else {
            magsize[Math.trunc(mag)]++;
          }
        }
      }
      magsize[6] = tremors.length;
      maglabel[6] = 'TOTAL';
      
      // Get weekly counts from beginning date
      const sdate = Date.parse('May 3, 2018');
      const sdate2 = new Date(sdate);
      const wmilli = (7*24*60*60*1000); // Number of milliseconds in a week
      const weekcnt = [];
      const weeklabel = [];
      let weeknum = 0;
      for( let i = 0; i < tremors.length; i++ ) {
        let j = Math.trunc( ( Date.parse(tremors[i].time) - sdate) / wmilli );
        let swkdt = new Date( ( j * wmilli ) + sdate );
        weekcnt[j] = weekcnt[j] ? ++weekcnt[j] : 1;
        weeklabel[j] = swkdt.toDateString().replace(/..../, '');
        // weeklabel[j] = weeklabel[j].replace(/ /g, '&nbsp');
        weeknum = weeknum < j ? j : weeknum;
      }
      weekcnt[ weeknum + 1] = tremors.length;
      weeklabel[ weeknum + 1] = "TOTAL";
      
      // Sending the data to view/tremors.pug
      res.render('tremors', { magsize: magsize, maglabel: maglabel, date: Date(), weekcnt: weekcnt, weeklabel: weeklabel } );
    }
    )
    .catch(function(err) {
      // The API failed and report error
      console.log(err);
    });

  // res.render('index', { title: 'Express' });
});
router.post('/', function(req, res) {
  console.log("Got Here!!");
  console.log(req.body.magnitude);
  res.send(req.body);
  // res.send(JSON.stringify(req.body.form));
});

module.exports = router;
