'use strict';

// Using week-03 problem as a framework, set up request/promise and express
const express = require('express');
const router = express.Router();
const reqprom = require('request-promise-native');

const mag_all = -1;
const week_all = -1;

let mag_count = [];  // Count column for the magnitude table; tally of magnitudes of the various size
let mag_label = []; // Label column for the magnitude table
let week_count = [];  // Count column for weekly table; tally of the number of tremors that week
let week_label = []; // Label column for weekly table and is first day of the week count

// define the JSON object has the data provided to the tremors.pug file to expand the HTML
let renderinfo = {
  mag_count: mag_count,
  mag_label: mag_label,
  date: Date(),
  week_count: week_count,
  week_label: week_label
};

/* GET home page. */
router.get('/', function(req, res) {
  // Call the fetch tremors function with the default values to print out all magnitudes in all weeks
  fetchtremors(res, mag_all, week_all);
});

/* POST web page */
router.post('/', function(req, res) {
  // Call the fetch tremors function with the values that are in the magnitude and week selection drop downs
  fetchtremors(res, Number(req.body.magnitude), Number(req.body.week));
});

/* The key function used by both the GET & POST methods to get data and send it to tremors.pug to render. */
function fetchtremors (res, magselect, weekselect) {
  // Set up the header parameters for the usgs.gov request for earthquake data
  const options = {
    // The URL to get all records around Kilauea since May 3rd to July 4th which is first complete week after end of class
    uri: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-05-03&endtime=2018-07-04&latitude=19.40&longitude=-155.27&maxradiuskm=80',
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  };

  /* go fetch USGS API data with request-promise */
  reqprom(options)
    .then(function(response) {
      const tremors = [];  // Array containing the list of properties for one earthquake/record
      let recordid = 0;    // Record number after filtering for 'Volcano'

      // Get weekly counts from beginning date
      const sdate = Date.parse('May 3, 2018');
      const millisec2week = (7*24*60*60*1000); // Number of milliseconds in a week
      let weeknummax = 0;
      // Truncate the mag_count and week_count arrays otherwise prior queries cumulate
      mag_count.length = 0;
      week_count.length = 0;
      
      // Loop through all the JSON records returned by the USGS API
      for ( let i = 0; i < response.features.length; i++ ) {

        // Declare variables to point to the USGS API properties and geometrys part of the returned JSON object
        const getprop = response.features[i].properties;
        const getgeo = response.features[i].geometry;
        
        // Get the title first and use to filter out the earthquakes not associated with the Volcano
        const title = getprop.title;
        if ( title.match('Volcano')) {
          // Declare and assign the other required fields of magnitude, time of tremore, longatude and lattitued
          const mag = getprop.mag;
          const magtrunc = Math.trunc(mag); // Convert magnitude from decimal to integer value
          const time = new Date(getprop.time);
          const lngtd = getgeo.coordinates[0];
          const latt = getgeo.coordinates[1];

          // Convert the time of tremor to the week number from May 3rd.
          // Subtract the tremor time from the May 3rd time and then divide to go from milliseconds to weeks
          const week_index = Math.trunc( ( Date.parse(time) - sdate) / millisec2week );

          // See if magnitude and week parameters are to be included. With GET method, all will fall through
          // With POST method, some to many may be filtered out
          if ( (magselect !== mag_all && magselect !== magtrunc) || (weekselect !== week_all && weekselect !== week_index) ) {
            continue; // Go to for loop
          }

          // Add the new earthquake properties to the tremor array
          tremors.push({num: recordid++, title: title, mag: mag, time: time, lngtd: lngtd, latt: latt});

          // Convert the time of tremor to the week number from May 3rd.
          // Subtract the tremor time from the May 3rd time and then divide to go from milliseconds to weeks
          // let week_index = Math.trunc( ( Date.parse(time) - sdate) / millisec2week );
          
          if ( magtrunc >= 5.0 ) {
            mag_count[5] = mag_count[5] ? mag_count[5] + 1 : 1;
            mag_label[5] = 'greater than 5.00';
          } else {
            mag_count[magtrunc] = mag_count[magtrunc] ? mag_count[magtrunc] + 1 : 1; // If variable undefined, set to 1
            mag_label[magtrunc] = `${ magtrunc } - ${ magtrunc }.99`; 
          }
          let swkdt = new Date( ( week_index * millisec2week ) + sdate );
          week_count[week_index] = week_count[week_index] ? ++week_count[week_index] : 1; // If variable undefined, set to 1
          week_label[week_index] = swkdt.toDateString().replace(/..../, ''); // Remove the 3 character day of week plus space
          weeknummax = weeknummax < week_index ? week_index : weeknummax; // The weekly table increase and need the max value
        }
      }
      mag_count[6] = recordid; 
      mag_label[6] = 'TOTAL';
      week_count[ weeknummax + 1] = recordid; 
      week_label[ weeknummax + 1] = "TOTAL";
      renderinfo.week_count = week_count;
      renderinfo.week_label = week_label;

      res.render('tremors', renderinfo );

    })
    .catch(function(err) {
    // The API failed and report error
      console.log(err);
    });
}

module.exports = router;
