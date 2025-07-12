import React from 'react';
import FormComponent from '../components/add_dataset_form';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';

const AddDataset = () => {
  const navigate = useNavigate();
  const handleCheCloud = () => {
    navigate('/'); 
}
  return (
    <>
    <div style={{ textAlign: 'left', marginLeft: '3rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
    <button 
        onClick={handleCheCloud}
        style={{
            padding: '0.5rem 1.3rem',
            fontSize: '1rem',
            backgroundColor: '#8da89f',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#7b978c'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#8da89f'}
    >
        Return to CHe Cloud
    </button>
  </div>
    <main className="container mt-5">
      <section className="bg-light p-5 rounded shadow-sm">
        <h1 className="mb-4 text-success">  
          Add a New Dataset into the  <span className="fw-bold">CHe Cloud</span>
        </h1>
        <p className="mb-4 text-muted">
          Please fill out the form below to submit a new dataset to the Cultural Heritage Cloud (CHe Cloud). This will create a Pull Request in the CHe Cloud GitHub repository, and an operator will check it and merge it if everything is correct.
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