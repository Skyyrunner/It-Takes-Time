import json
import os

# list of all chapters.
indexobj = {};

for dirpath, dirname, filenames in os.walk("config"):
    for filename in filenames:
        with open(dirpath + "/" + filename, encoding="utf-8") as configfile:
            config = json.load(configfile)

        content = []
        obj = {
            "content": content,
            "name": config["name"],
            "uid": config["uid"],
            "next": config["next"],
            "choices": config["choices"],
            "slot": config["slot"]
        }

        if "also" in config:
            obj["also"] = config["also"]

        with open("raw/" + config["input"], encoding="utf-8") as fin:
            for line in fin:
                if line[-1] == "\n":
                    line = line[:-1]
                if len(line) > 0:
                    content.append(line)

        indexobj[obj["uid"]] = obj;

with open("storydata.json", "w", encoding="utf-8") as f:
    json.dump(indexobj, f, indent=2)