import React from 'react';
import FormComponent from '../components/add_dataset_form';

const ContactPage = () => {
  return (
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
    </main>
  );
};

export default ContactPage;