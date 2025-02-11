import json
import requests
import os
from openai import OpenAI

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

l = LODCloudFilter()
l.filter_by_keywords()
l.filter_by_title_and_description()
l.ch_lodcloud_intersection(['../data/CHlodcloud_data_keyword.json','../data/CHlodcloud_data_title_description.json'])
