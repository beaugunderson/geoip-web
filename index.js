var express = require('express');
var GeoIP2 = require('geoip2');
var _ = require('lodash');

var db = new GeoIP2('./GeoLite2-City.mmdb');

// Uses equirectangular approximation for speed
function approximateDistance(lat1, lon1, lat2, lon2) {
  lat1 = lat1 * Math.PI / 180;
  lon1 = lon1 * Math.PI / 180;

  lat2 = lat2 * Math.PI / 180;
  lon2 = lon2 * Math.PI / 180;

  var R = 6371;

  var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  var y = (lat2 - lat1);

  return Math.sqrt(x * x + y * y) * R;
}

function resultFromAddress(req, opt_address) {
  if (!opt_address) {
    opt_address = _.last(req.ips) || req.connection.remoteAddress;
  }

  var geoData = db.getGeoData(opt_address);

  if (!geoData || !geoData.location) {
    return {
      ip: opt_address,
      location: 'unknown'
    };
  }

  var result = {
    ip: opt_address
  };

  if (req.param('fields')) {
    var fields = req.param('fields').split(',');

    fields.forEach(function (field) {
      result[field] = geoData[field];
    });
  } else {
    result.country = geoData.country;
    result.location = geoData.location;
  }

  if (req.param('lat') && req.param('lon') && req.param('distance')) {
    var lat = parseFloat(req.param('lat'), 10);
    var lon = parseFloat(req.param('lon'), 10);

    var distance = parseInt(req.param('distance'), 10);

    result.distance = approximateDistance(geoData.location.latitude,
      geoData.location.longitude, lat, lon) < distance;
  }

  return result;
}

var app = express();

app.enable('trust proxy');

app.get('/', function (req, res) {
  res.jsonp(resultFromAddress(req));
});

app.get('/favicon.ico', function (req, res) {
  res.send(404);
});

app.get('/:address', function (req, res) {
  if (!req.param('address')) {
    return res.send(500);
  }

  res.jsonp(resultFromAddress(req, req.param('address')));
});

app.listen(process.env.PORT || 3000);
