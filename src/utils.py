import json
import csv
from itertools import chain, combinations

def lodcloudjson_to_csv(lodcloud_json_file, csv_filename):

    with open(lodcloud_json_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    with open(csv_filename, "w", newline="", encoding="utf-8") as csvfile:
        fieldnames = ["_id", "title", "keywords", "description", "topic", "url"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()

        for resource_id, resource_data in data.items():
            description = resource_data.get("description", {})
            description_text = description.get("en", "") if isinstance(description, dict) else ""
            description_text = description_text.replace("\n", " ") if description_text is not None else ""
            description_text = description_text.replace(",", " ")
            description_text = description_text.replace("\r", " ")

            writer.writerow({
                "_id": resource_data.get("_id", ""),
                "title": resource_data.get("title", ""),
                "keywords": "; ".join(resource_data.get("keywords", [])),  # Join keywords into a single string
                "description": description_text.strip(),
                "topic" : "" ,
                "url": f"https://lod-cloud.net/dataset/{resource_id}",
            })

def generate_subsets(keywords):
    """Generate all possible non-empty subsets of the keyword list."""
    return chain.from_iterable(combinations(keywords, r) for r in range(1, len(keywords) + 1))