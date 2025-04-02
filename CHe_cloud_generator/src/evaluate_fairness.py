import pandas as pd
import utils 

class EvaluateFAIRness:

    def __init__(self,quality_data_to_evaluate, output_file_path):
        self.quality_data_to_evaluate = quality_data_to_evaluate
        self.output_file_path = output_file_path
        self.fairness_evaluation = self.initialize_output_file()

            
    def evaluate_findability(self):
        quality_data = pd.read_csv(self.quality_data_to_evaluate[0])

        #TODO: Manage the manually picked, for these, only zenodo is suitable or any search engine offers a persistant id.
        if not 'manually_picked_only_sparql.csv' in self.quality_data_to_evaluate[0]: # For those not manually picked, the data are in the LOD Cloud for sure
            self.fairness_evaluation["F1-M Unique and persistent ID"] = 1
        
        self.fairness_evaluation["F1-D URIs dereferenceability"] = (pd.to_numeric(quality_data['URIs Deferenceability'], errors='coerce').fillna('-'))

        #For the manually added, we cannot give 1 if they are not in the LOD Cloud, we ha
        if 'manually_picked_only_sparql.csv' in self.quality_data_to_evaluate[0]:
            sparql_indication = quality_data["SPARQL endpoint URL"].apply(lambda x: 1 if pd.notna(x) and x != '' else 0)
            void_availability = quality_data['Url file VoID'].apply(lambda x: 1 if pd.notna(x) and x != '' else 0)
            self.fairness_evaluation["F2a-M - Metadata availability via standard primary sources"] = (
                (sparql_indication == 1) | (void_availability == 1)
            ).astype(int)
        else:
            self.fairness_evaluation["F2a-M - Metadata availability via standard primary sources"] = 1 #Other, are at least in LOD Cloud, we can use those metadata

        #TODO: F2b-M

        if not 'manually_picked_only_sparql.csv' in self.quality_data_to_evaluate[0]: # For those not manually picked, the data are in the LOD Cloud for sure
            self.fairness_evaluation["F3-M Data referrable via a DOI"] = quality_data['KG id'].apply(utils.recover_doi_from_lodcloud)

        #TODO: Manage the manually picked (use a column in the CSV to indicate if is on GitHub or Zenodo)
        if not 'manually_picked_only_sparql.csv' in self.quality_data_to_evaluate[0]: # For those not manually picked, the data are in the LOD Cloud for sure
            self.fairness_evaluation["F4-M Metadata registered in a searchable engine"] = 1

        print("Findability evaluation completed!")


    def evaluate_availability(self):
        quality_data = pd.read_csv(self.quality_data_to_evaluate[0])

        sparql_availability = quality_data["Sparql endpoint"].apply(lambda x: 1 if x == 'Available' else 0)
        dump_availability = quality_data["Availability of RDF dump (metadata)"].apply(lambda x: 1 if x in [1,"1"] else 0) # No consideration about the mediatype of the available dummp
        self.fairness_evaluation["A1-D Working access point(s)"] = (
            (sparql_availability == 1) | (dump_availability == 1)
        ).astype(int)

        #TODO: A1-M We cannot check only if the link is ON, we shouldn't check if the metadata are there? (es. SPARQL Up, ma no embedded metadata)
        
        self.fairness_evaluation["A1.2 Authentication & HTTPS support"] = quality_data.apply(
            lambda row: "Check manually" if row["Requires authentication"] in ["False", False, '-'] and row["Sparql endpoint"] in ["offline", "-"]
            else ((0 if row["Use HTTPS"] in [False, 'False'] and 'https' in row['SPARQL endpoint URL'] else 1)  + (1 if row["Requires authentication"] in ["False", False, True, 'True'] else 0.5)) / 2,
            axis=1
        )

        # TODO: for the manually picked, we have to manually check if is in LOD Cloud, Zenodo, GitHub ecc...
        if not 'manually_picked_only_sparql.csv' in self.quality_data_to_evaluate[0]:
            self.fairness_evaluation["A2-M Registered in search engines"] = 1
    
    def evaluate_reusability(self):
        quality_data = pd.read_csv(self.quality_data_to_evaluate[0])

        self.fairness_evaluation['R1.1 Machine- or human-readable license retrievable via any primary source'] = quality_data.apply(
            lambda row: 1 if (
                pd.notna(row['License machine redeable (metadata)']) and row['License machine redeable (metadata)'] not in ['-', '']
            ) or (
                pd.notna(row['License machine redeable (query)']) and row['License machine redeable (query)'] not in ['-', '']
            ) or (
                row['License human redeable'] in [True, 'True']
            ) else 0,
            axis=1
        )

        self.fairness_evaluation['R1.2 Publisher information, such as authors, contributors, publishers, and sources'] = quality_data.apply(utils.check_publisher_info,axis=1)

        self.fairness_evaluation['']

    def initialize_output_file(self):
        quality_data = pd.read_csv(self.quality_data_to_evaluate[0])
        output_df = pd.DataFrame({
            "KG id": quality_data["KG id"],             
            "KG name": quality_data["KG name"],         
        })

        return output_df

    def save_file(self):
        self.fairness_evaluation.to_csv(self.output_file_path,index=False)
    

fairness = EvaluateFAIRness(['../data/quality_data/2025-03-16_CHe_cloud_manually_extracted.csv'],'test.csv')
fairness.evaluate_findability()
fairness.evaluate_availability()
fairness.evaluate_reusability()
fairness.save_file()