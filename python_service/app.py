from flask import Flask, request, jsonify
from generate_weather_station_data import GenerateWeatherStationData
app = Flask(__name__)


weather_station_data = GenerateWeatherStationData()

@app.route("/sparql_endpoint", methods=["GET"])
def sparql_endpoint():
    sparql_data = weather_station_data.group_by_metric_value('Sparql endpoint')

    return jsonify(sparql_data)

@app.route("/license", methods=["GET"])
def license():
    license_data = weather_station_data.group_by_metric_value('License machine redeable (metadata)')

    return jsonify(license_data)

@app.route("/media_type", methods=["GET"])
def media_type():
    media_type = weather_station_data.group_by_metric_value_list('metadata-media-type')

    return jsonify(media_type)

@app.route("/fair_stats", methods=["GET"])
def fair_stats():
    fair_stats = {}
    boxplot_metrics = ['F score', 'A score', 'I score', 'R score', 'FAIR score']
    for metric in boxplot_metrics:
        fair_stats[metric] = weather_station_data.generate_boxplot_values(metric)

    return jsonify(fair_stats)

@app.route("/datasets_stats", methods=["GET"])
def datasets_stats():
    datasets_stats = weather_station_data.generate_count_statistics()

    return datasets_stats


