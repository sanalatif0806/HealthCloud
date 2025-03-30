import os
import json

def create_list_and_move(path_dataset_to_include_in_the_cloud):
    here = os.path.dirname(os.path.abspath(__file__))
    # Load the JSON file
    lodcloud_data_list = []
    with open(os.path.join(here, path_dataset_to_include_in_the_cloud)) as f:
        lodcloud_data = json.load(f)
        # Create a list of dictionaries
        for key in lodcloud_data:
            lodcloud_data_list.append(lodcloud_data[key])

    absolute_path = os.path.abspath(os.path.join('..','..','WebApp/backend/mongo_data/'))
    with open(absolute_path + '/CHe_cloud_data.json', 'w') as f:
        json.dump(lodcloud_data_list, f, indent=4)

create_list_and_move('../data/CHlodcloud_data_manual_selected.json')