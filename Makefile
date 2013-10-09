all: GeoLite2-City.mmdb

GeoLite2-City.mmdb:
	wget http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz
	gunzip GeoLite2-City.mmdb.gz
