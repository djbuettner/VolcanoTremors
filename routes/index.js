'use strict';

// Using week-03 problem as a framework, set up request/promise and express
const express = require('express');
const router = express.Router();
const reqprom = require('request-promise-native');

let magsize = [];  // Define and intialize the tremor magnitude size
let maglabel = [];
let weekcnt = [];
let weeklabel = [];
let renderinfo = {
      magsize: magsize,
      maglabel: maglabel,
      date: Date(),
      weekcnt: weekcnt,
      weeklabel: weeklabel
};



/* GET home page. */
router.get('/', function(req, res) {
  fetchtremors(res);
});

router.post('/', function(req, res) {
  console.log("Got Here!!");
  console.log(req.body.magnitude);
  res.send(req.body);
  // res.send(JSON.stringify(req.body.form));
});


function fetchtremors (res) {
  // Set up the header parameters for the usgs.gov request for earthquake data
  const options = {
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

      // Get weekly counts from beginning date
      const sdate = Date.parse('May 3, 2018');
      const sdate2 = new Date(sdate);
      const wmilli = (7*24*60*60*1000); // Number of milliseconds in a week
      let weeknummax = 0;
      weekcnt = [];

      // Loop through all the JSON records returned by the USGS API
      for ( let i = 0; i < response.features.length; i++ ) {
        // Declare the needed variables
        const getprop = response.features[i].properties;
        const getgeo = response.features[i].geometry;
        let title, mag, time, lngtd, latt, magtrunc;
        // Get the title first and use to filter out the earthquakes not associated with the Volcano
        // const title = response.features[i].properties.title;
        title = getprop.title;
        if ( title.match('Volcano')) {
          mag = getprop.mag;
          time = new Date(getprop.time);
          lngtd = response.features[i].geometry.coordinates[0];
          latt = response.features[i].geometry.coordinates[1];
          // Add the new earthquake properties to the tremor array
          tremors.push({num: recordid++, title: title, mag: mag, time: time, lngtd: lngtd, latt: latt});
          // Make table for range
          magtrunc = Math.trunc(mag);
          if ( magtrunc >= 5.0 ) {
            magsize[5] = magsize[5] ? magsize[5] + 1 : 1;
            maglabel[5] = 'greater than 5.00';
          } else {
            magsize[magtrunc] = magsize[magtrunc] ? magsize[magtrunc] + 1 : 1;
            maglabel[magtrunc] = `${ magtrunc } - ${ magtrunc }.99`; 
          }
          let j = Math.trunc( ( Date.parse(time) - sdate) / wmilli );
          let swkdt = new Date( ( j * wmilli ) + sdate );
          weekcnt[j] = weekcnt[j] ? ++weekcnt[j] : 1;
          weeklabel[j] = swkdt.toDateString().replace(/..../, '');
          weeknummax = weeknummax < j ? j : weeknummax;
        }
      }
      magsize[6] = tremors.length;
      maglabel[6] = 'TOTAL';
      weekcnt[ weeknummax + 1] = tremors.length;
      weeklabel[ weeknummax + 1] = "TOTAL";
      renderinfo.weekcnt = weekcnt;
      renderinfo.weeklabel = weeklabel;

      res.render('tremors', renderinfo );

  })
  .catch(function(err) {
    // The API failed and report error
    console.log(err);
  });
}

module.exports = router;
