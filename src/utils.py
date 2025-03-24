import json
import csv
from itertools import chain, combinations
import pandas as pd
import os
from sklearn.metrics import cohen_kappa_score

here = os.path.dirname(os.path.abspath(__file__))
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

def combine_csv_files(csv_file1,csv_file2,output_csv):
    csv1 = pd.read_csv(csv_file1)
    csv2 = pd.read_csv(csv_file2)

    csv1 = csv1.rename(columns={"topic": "Maria_Angela_Topic"})

    sort_column = "_id"

    csv1 = csv1.sort_values(by=sort_column).reset_index(drop=True)
    csv2 = csv2.sort_values(by=sort_column).reset_index(drop=True)

    csv1["Gabriele_Topic"] = csv2["topic"]

    csv1["Final_decision"] = ""

    csv1.to_csv(output_csv, index=False)

def calculate_cohen_kappa(csv_file1,csv_file2):

    df1 = pd.read_csv(csv_file1) 
    df2 = pd.read_csv(csv_file2)  

    # Specify the column name where annotations are stored
    maria_angela_topic = "topic"  # Replace with actual column name in annotator1.csv
    gabriele_topic = "topic"  # Replace with actual column name in annotator2.csv

    df1 = df1.sort_values(by='_id').reset_index(drop=True)
    df2 = df2.sort_values(by='_id').reset_index(drop=True)

    print(df1.shape, df2.shape)
    # Extract annotations
    annotator1 = df1[maria_angela_topic].tolist()
    annotator2 = df2[gabriele_topic].tolist()

    # Compute Cohen’s Kappa
    kappa = cohen_kappa_score(annotator1, annotator2)

    print(f"Cohen's Kappa: {kappa:.4f}")

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

def calculate_precision_recall(gold_standard_path, dataset_to_verify_path):

    with open("gold_standard.json") as f:
        gold_standard = json.load(f)

    with open("predicted.json") as f:
        predicted = json.load(f)

    # Assuming both JSONs have a list of labels (adjust extraction as needed)
    y_true = gold_standard["labels"]  # Modify key as per your JSON structure
    y_pred = predicted["labels"]      # Modify key as per your JSON structure

    # Compute precision and recall
    precision = precision_score(y_true, y_pred, average="macro")  # Change "macro" if needed
    recall = recall_score(y_true, y_pred, average="macro")

    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")   

    

#compare_csv_topics("../data/manually_annotated_kgs/LODCloud_annotation_Gabriele.csv", "../data/manually_annotated_kgs/LODCloud_annotation_Maria Angela.csv","../data/manually_annotated_kgs/LODCloud_annotation_Sana.csv","../data/manually_annotated_kgs/mismatches_gab_mary_sana_HEALTH.csv", 'health')
#combine_csv_files(os.path.join(here,"../data/lodcloud_manual_tagged/Maria_Angela_manual_tagged.csv"),os.path.join(here,"../data/lodcloud_manual_tagged/Gabriele_manual_tagged.csv"),os.path.join(here, "../data/lodcloud_manual_tagged/lodcloud_manual_tagged_merged.csv"))
#calculate_cohen_kappa(os.path.join(here,"../data/lodcloud_manual_tagged/Maria_Angela_manual_tagged.csv"),os.path.join(here,"../data/lodcloud_manual_tagged/Gabriele_manual_tagged.csv"))
