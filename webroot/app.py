import pandas as pd
import numpy as np
import requests, json
from flask import Flask, jsonify, render_template, redirect
from flask_pymongo import PyMongo




#################################################
# Database Setup
#################################################

app = Flask(__name__)
mongo = PyMongo(app, uri ="mongodb://localhost:27017/guru_db2")



@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/trip/<tripID>")
def oneBusPos(tripID):
    positions = mongo.db.buspos.find({'TripID':tripID})
    result = {}
    for position in positions:
        lat = position['Lat']
        lon = position['Lon']
        dt = position['DateTime']
        result.update({dt:{"lat":lat, "lon":lon}})
    return jsonify(result)
    

