all: GeoLite2-City.mmdb node_modules

clean:
	rm GeoLite2-City.mmdb
	rm -rf node_modules

.PHONY: all clean

GeoLite2-City.mmdb:
	curl -O http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz
	gunzip GeoLite2-City.mmdb.gz

node_modules: package.json
	npm install
