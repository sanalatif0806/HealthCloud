import json
import csv
from itertools import chain, combinations
import pandas as pd

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

def compare_csv_topics(file1, file2,file3, output_file,topic_disagrement_to_check):
    # Load the CSV files
    gabriele = pd.read_csv(file1).sort_values(by='_id').reset_index(drop=True)
    mariangela = pd.read_csv(file2).sort_values(by='_id').reset_index(drop=True)
    sana = pd.read_csv(file3).sort_values(by='_id').reset_index(drop=True)
    

    comparison_df = mariangela.copy()
    comparison_df = comparison_df.rename(columns={'topic': 'Mariangela_topic'})

    comparison_df['Gabriele_topic'] = gabriele['topic']
    comparison_df['Sana_topic'] = sana['Topic']


    disagreement_rows = comparison_df[
        (comparison_df['Gabriele_topic'] != comparison_df['Mariangela_topic']) |
        (comparison_df['Gabriele_topic'] != comparison_df['Sana_topic']) |
        (comparison_df['Mariangela_topic'] != comparison_df['Sana_topic'])
    ]

    cultural_heritage_disagreement = disagreement_rows[
        (disagreement_rows['Gabriele_topic'] == topic_disagrement_to_check) |
        (disagreement_rows['Mariangela_topic'] == topic_disagrement_to_check) |
        (disagreement_rows['Sana_topic'] == topic_disagrement_to_check)
    ]

    # Save to output CSV
    cultural_heritage_disagreement.to_csv(output_file, index=False)
    

# Example usage
compare_csv_topics("../data/manually_annotated_kgs/LODCloud_annotation_Gabriele.csv", "../data/manually_annotated_kgs/LODCloud_annotation_Maria Angela.csv","../data/manually_annotated_kgs/LODCloud_annotation_Sana.csv","../data/manually_annotated_kgs/mismatches_gab_mary_sana_HEALTH.csv", 'health')