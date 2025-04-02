import pandas as pd

class EvaluateFAIRness:

    def __init__(self,quality_data_to_evaluate, output_file_path):
        self.quality_data_to_evaluate = quality_data_to_evaluate
        self.output_file_path = output_file_path
        self.fairness_evaluation = self.initialize_output_file()

            
    def evaluate_findability(self):
        quality_data = pd.read_csv(self.quality_data_to_evaluate[0])

        #TODO: Manage the manually picked 
        if not 'manually_picked_only_sparql.csv' in self.quality_data_to_evaluate[0]: # For those not manually picked, the data are in the LOD Cloud for sure
            self.fairness_evaluation["F1 - ID"] = 1

        sparql_availability = quality_data['Sparql endpoint'].apply(lambda x: 1 if x == 'Available' else 0)
        rdf_dump_availability = quality_data['Availability of RDF dump (metadata)'].apply(lambda x: 1 if x in [1,"1"] else 0)
        void_availability = quality_data['Availability VoID file'].apply(lambda x: 1 if x == 'VoID file available' else 0)
        self.fairness_evaluation["F2a - Number of primary sources"] = (sparql_availability + rdf_dump_availability + void_availability) / 3

        #TODO: F2b

        sparql_indication = quality_data["SPARQL endpoint URL"].apply(lambda x: 1 if pd.notna(x) and x != '' else 0)
        rdf_dump_indication = quality_data["Availability of RDF dump (metadata)"].apply(lambda x: 1 if x not in [-1, "-1"] else 0)
        self.fairness_evaluation["F3 - Link to the Data"] = sparql_indication | rdf_dump_indication  
        
        #TODO: Manage the manually picked (use a column in the CSV to indicate if is on GitHub or Zenodo)
        if not 'manually_picked_only_sparql.csv' in self.quality_data_to_evaluate[0]: # For those not manually picked, the data are in the LOD Cloud for sure
            self.fairness_evaluation["F4 - Is in a search engine"] = 1

        print("Findability evaluation completed!")

    
    
    def initialize_output_file(self):
        quality_data = pd.read_csv(self.quality_data_to_evaluate[0])
        output_df = pd.DataFrame({
            "KG id": quality_data["KG id"],             
            "KG name": quality_data["KG name"],         
        })

        return output_df
    

fairness = EvaluateFAIRness(['../data/quality_data/LOD-Cloud_no_refined.csv'],'test.csv')
fairness.evaluate_findability()