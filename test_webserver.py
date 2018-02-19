# server mock for frontend development
import os
from flask import Flask, send_from_directory, redirect
app = Flask(__name__)

@app.route("/data/<path:filename>")
def getfic(filename=None):
    return send_from_directory(os.path.join(".", "storydata"), filename)

@app.route("/")
def main():
    return "Hi."