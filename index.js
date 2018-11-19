import express from 'express';
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

app.route('/searchStops/:streetName')
    .get((req, res) => {
        (async function getAllBusStops() {
            const url = "https://opendurham.nc.gov/api/records/1.0/search/?dataset=gotriangle-stops-cary-ch-duke-durham-raleigh-wofline&q=" + req.params.streetName + "&facet=municipality";
            const stops = await fetch(url);
            const busStops = await stops.json();

            const crimeUrls = busStops.records.map(record => { 
                var stopName = record.fields["stop_name"];
                var stopLatitude = record.fields["stop_lat"];
                var stopLongitude = record.fields["stop_lon"];

                let crimeUrl = "https://opendurham.nc.gov/api/records/1.0/search/?dataset=durham-police-crime-reports&facet=date_rept&facet=dow1&facet=reportedas&facet=chrgdesc&facet=big_zone&geofilter.distance=" + stopLatitude + "," + stopLongitude + "," + 50;
                return crimeUrl;
            });

            (async function getAllCrimes(urls) {
                const crimePromises = urls.map(async (url) => {
                    const report = await fetch(url);
                    return await report.json();
                });
                Promise.all(crimePromises).then((values) => {
                    res.send(values);
                });
            })(crimeUrls);
        })();
    });
    
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
