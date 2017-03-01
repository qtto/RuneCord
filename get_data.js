/* This function gets the clan data every X couple of minutes.
   set this up as a cron job or add loop functionality to the script. */


var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

fs.readFile('client_secret.txt', 'utf8', function readData(err, api_key) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  get_data(api_key);
});

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function get_data(api_key) {
  let sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    key: api_key,
    spreadsheetId: '1kFeViTfq33UgGll6TptJN6qwoKmKDCUZf1L-cjK_6Fo',
    range: 'PublicView!B2:G502', // RSN / rank / CP / Cap status / next rank:caps / next rank:xp
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    let rows = response.values;
    let clannies = new Object();

    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        row[3] = row[3].toLowerCase() != 'yes' ? 'no' : 'yes';

        let name = row[0];
        clannies[name] = {
            'name':     row[0],
            'rank':     row[1],
            'cp':       row[2],
            'cap':      row[3],
            'rankCaps': row[4],
            'rankXp':   row[5]
        };
      }

      // Write data to file
      let json = JSON.stringify(clannies);
      fs.writeFile('clannies.json', json, 'utf8', function (err) {
          if (err) return console.log(err);
      });
    }
  });
}
