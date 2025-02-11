import json
import requests
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')

here = os.path.dirname(os.path.abspath(__file__))

class LODCloudFilter:
    def __init__(self):
        try:
            response = requests.get("https://lod-cloud.net/versions/latest/lod-data.json")
            self.lodcloud_data = response.json()
            with open(os.path.join(here,'../data/lodcloud_data.json'), "w", encoding="utf-8") as file:
                json.dump(self.lodcloud_data, file)
        except:
            with open(os.path.join(here,'../data/lodcloud_data.json'), "r", encoding="utf-8") as file:
                self.lodcloud_data = json.load(file)
    
    def write_filtered_data(self, data, filter_type):
        with open(os.path.join(here,f'../data/CHlodcloud_data_{filter_type}.json'), "w", encoding="utf-8") as file:
            json.dump(data, file)

    def filter_by_keywords(self):
        filtered_kgs = {}
        ch_keywords = json.load(open(os.path.join(here,'../data/CH_keywords.json'), "r", encoding="utf-8"))
        ch_keywords = ch_keywords['keywords']
        kgs_in_lodcloud = self.lodcloud_data.keys()
        for kg in kgs_in_lodcloud:
            kg_metadata = self.lodcloud_data[kg]
            kg_metadata_keywords = kg_metadata['keywords']
            for keyword in ch_keywords:
                if keyword in kg_metadata_keywords:
                    filtered_kgs[kg] = kg_metadata       
        print(f"Extracted {len(filtered_kgs.keys())} resources by analyzing keywords in the dataset metadata")
        self.write_filtered_data(filtered_kgs, "keyword")    

    def filter_by_title_and_description(self):
        filtered_kgs = {}
        ch_keywords = json.load(open(os.path.join(here,'../data/CH_keywords.json'), "r", encoding="utf-8"))
        ch_keywords = ch_keywords['keywords']
        for kg in self.lodcloud_data.keys():
            kg_metadata = self.lodcloud_data[kg]
            kg_metadata_title = kg_metadata['title']
            kg_metadata_description = kg_metadata['description']
            for keyword in ch_keywords:
                if keyword in kg_metadata_title or keyword in kg_metadata_description:
                    filtered_kgs[kg] = kg_metadata       
        print(f"Extracted {len(filtered_kgs.keys())} resources by analyzing title and description in the dataset metadata")
        self.write_filtered_data(filtered_kgs, "title_description")    

    def ch_lodcloud_intersection(self,path_of_data_to_intersect):
        intersected_data = {}
        for path in path_of_data_to_intersect:
            ch_lodcloud_data = json.load(open(os.path.join(here,path), "r", encoding="utf-8"))
            for kg in ch_lodcloud_data.keys():
                if kg in self.lodcloud_data.keys():
                    intersected_data[kg] = self.lodcloud_data[kg]
        print(f"Extracted {len(intersected_data.keys())} resources by intersecting all methods used")
        self.write_filtered_data(intersected_data, "intersection")


    def filter_with_gpt(self):
        client = OpenAI(api_key=openai_api_key)
        categorize_prompt = '''
            I give you some description and title about dataset in the Linked Open Data Cloud, I have to categorize it as Cultural Heritage or Not.  
            For datasets that are Cultural Heritage, you also need to further specify whether it is Tangible, Intangible, Natural Heritage and finally those that define thesaurus and data models, classify them as Terminology.  
            You will be provided with a dataset description, title and the id, and you will output a json object containinig the following information:
            {
                "id": "dataset_id",
                "category": "Cultural Heritage",
                "sub_category": "Tangible"
            }
            If the dataset is not part of the Cultural Heritage category, do not enter the "category" key. If the dataset is of type Cultural Heritage, but you cannot define the sub category, do not enter the key “sub_category”.
        '''
        tasks = []
        for index, kg in enumerate(self.lodcloud_data.keys()):
            kg_metadata = self.lodcloud_data[kg]
            kg_data_prompt = f"dataset_id: {kg}\nTitle: {kg_metadata['title']}\nDescription: {kg_metadata['description']['en']}"
            task = {
                "custom_id": f"task-{index}",
                "method": "POST",
                "url": "/v1/chat/completions",
                "body": {
                    "model": "gpt-4o-mini",
                    "temperature": 0.1,
                    "response_format": { 
                        "type": "json_object"
                    },
                    "messages": [
                        {
                            "role": "system",
                            "content": categorize_prompt
                        },
                        {
                            "role": "user",
                            "content": kg_data_prompt
                        }
                    ],
                }
            }
            tasks.append(task)
       
        with open(os.path.join(here,'../data/gpt_tasks.jsonl'), 'w') as file:
            for obj in tasks:
                file.write(json.dumps(obj) + '\n')
        
        batch_file = client.files.create(
            file=open(os.path.join(here,'../data/gpt_tasks.jsonl'), "rb"),
            purpose="batch"
        )

        print(batch_file)
        
        batch_job = client.batches.create(
            input_file_id=batch_file.id,
            endpoint="/v1/chat/completions",
            completion_window="24h"
        )

        batch_job = client.batches.retrieve(batch_job.id)
        print(batch_job)

    def retrieve_and_save_job_result(self, job_id):
        client = OpenAI(api_key=openai_api_key)
        batch_job = client.batches.retrieve(job_id)
        result_file_id = batch_job.output_file_id
        result = client.files.content(result_file_id).content

        result_file_name = os.path.join(here,'../data/batch_job_results.jsonl')
        with open(result_file_name, 'wb') as file:
            file.write(result)

        results = []
        with open(result_file_name, 'r') as file:
            for line in file:
                json_object = json.loads(line.strip())
                results.append(json_object)
        
        json_results = []
        for result in results:
            json_response = result['response']['body']['choices'][0]['message']['content']
            json_results.append(json.loads(json_response))
        
        with open(os.path.join(here,'../data/gpt_results.json'), "w", encoding="utf-8") as file:
            json.dump(json_results, file)
    
    def from_gpt_response_to_lodcloud_data(self):
        filtered_kgs = {}
        gpt_results = json.load(open(os.path.join(here,'../data/gpt_results.json'), "r", encoding="utf-8"))
        for result in gpt_results:
            kg_id = result['id']
            if 'category' in result:
                kg_metadata = self.lodcloud_data[kg_id]
                category = result['category']
                kg_metadata['keywords'].append(category)
                if 'sub_category' in result:
                    sub_category = result['sub_category']
                    kg_metadata['keywords'].append(sub_category)
                filtered_kgs[kg_id] = kg_metadata
        
        self.write_filtered_data(filtered_kgs, "gpt_filtered")


l = LODCloudFilter()
# l.filter_by_keywords()
# l.filter_by_title_and_description()
# l.ch_lodcloud_intersection(['../data/CHlodcloud_data_keyword.json','../data/CHlodcloud_data_title_description.json'])
l.filter_with_gpt()