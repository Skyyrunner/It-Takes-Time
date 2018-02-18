# server mock for frontend development
import os
from flask import Flask, send_from_directory, redirect
app = Flask(__name__)

@app.route("/storydata/<path:filename>")
def getfic(filename=None):
    print(filename)
    print(os.path.join(".", "storydata", "data"))
    return send_from_directory(os.path.join(".", "storydata", "data"), filename)


@app.route("/")
def main():
    return "Hi."