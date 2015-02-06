# StatsD Zag backend

Basic [StatsD](https://github.com/etsy/statsd) backend for for Voxer's [Zag](http://voxer.github.io/zag/) metric server.

Current version sends aggregated metrics on flush.
The plan is to optionally add 'packet mode' that directly pipes the metric events to Zag.

## Configuration

| Type       | Default                  | Description         |
| ---------- | ------------------------ | ------------------- |
| daemons    | `["127.0.0.1:8876"]`     | List of zag daemons |
| key_rules  | `{"statsd.": "statsd>"}` | Key transformations |


`key_rules` define a string replacement for key names to allow you to transform statsd keys to the more powerful [Zag keys](http://voxer.github.io/zag/#metrics-keys).
The key: val pair simply get mapped to String.replace attributes.


### Example Configuration

```json
{
	"port": 8125,
	"backends": [ "statsd-zag-backend" ],
	"zag": {
		"daemons": [ "127.0.0.1:8876" ],
		"key_rules": {
			"statsd.": "statsd>",
			"vulcand.": "vulcand>"
		}
	}
}
```


## License

Licensed 2015 under the MIT License (MIT)
