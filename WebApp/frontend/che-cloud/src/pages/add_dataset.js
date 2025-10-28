import React from 'react';
import FormComponent from '../components/add_dataset_form';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { useLocation } from 'react-router-dom';

const AddDataset = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dataset_id = queryParams.get('dataset_id');
  const navigate = useNavigate();
  const handleCheCloud = () => {
    navigate('/'); 
}

  return (
    <>
      <div className="container-fluid mt-3 px-4">
      <Navbar />
        </div>
    <div style={{ textAlign: 'left', marginLeft: '3rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
  </div>
    <main className="container mt-5">
      <section className="bg-light p-5 rounded shadow-sm">
        <h1 className="mb-4 text-success">  
          {dataset_id ? (
            <> Modify the Dataset metadata into the  <span className="fw-bold">CHe Cloud</span></>
          ) : (
           <> Add a New Dataset into the  <span className="fw-bold">CHe Cloud</span></>
          )}
        </h1>
        <p className="mb-4 text-muted">
          {
            dataset_id ? (
              <> Please modify the dataset metadata below to update the information in the Cultural Heritage Cloud (CHe Cloud). This will create a Pull Request in the CHe Cloud GitHub repository, and an operator will check it and merge it if everything is correct. </>
            ) : (
              <> Please fill out the form below to submit a new dataset to the Cultural Heritage Cloud (CHe Cloud). This will create a Pull Request in the CHe Cloud GitHub repository, and an operator will check it and merge it if everything is correct. </>
            )
          }
        </p>
        <p className="mb-4 text-muted"><span className="fw-bold">N.B:</span> If you fill in all the fields, your dataset will have a better chance of having a higher FAIRness score.</p>
        <FormComponent />
      </section>
      <Footer />
    </main>
    </>
  );
};

export default AddDataset;