var express = require('express');
var GeoIP2 = require('geoip2');

var db = new GeoIP2('./GeoLite2-City.mmdb');

var DC_LATITUDE = 38.8951;
var DC_LONGITUDE = -77.0367;

// Uses equirectangular approximation for speed
function distance(lat1, lon1, lat2, lon2) {
  lat1 = lat1 * Math.PI / 180;
  lon1 = lon1 * Math.PI / 180;

  lat2 = lat2 * Math.PI / 180;
  lon2 = lon2 * Math.PI / 180;

  var R = 6371;

  var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  var y = (lat2 - lat1);

  return Math.sqrt(x * x + y * y) * R;
}

function resultFromAddress(address) {
  address = db.getGeoData(address);

  var kilometersFromDC = distance(address.location.latitude,
    address.location.longitude, DC_LATITUDE, DC_LONGITUDE);

  return {
    kilometersFromDC: kilometersFromDC,
    withinHundredKilometers: kilometersFromDC <= 100,
    location: address.location
  };
}

var app = express();

app.get('/', function (req, res) {
  res.json(resultFromAddress(req.connection.remoteAddress));
});

app.get('/:address', function (req, res) {
  if (!req.param('address')) {
    return res.send(500);
  }

  res.json(resultFromAddress(req.param('address')));
});

app.get('/favicon.ico', function (req, res) {
  res.send(404);
});

app.listen(process.env.PORT || 3000);