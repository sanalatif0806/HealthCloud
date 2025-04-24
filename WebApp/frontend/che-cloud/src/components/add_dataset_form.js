import React, { useState } from 'react';

const FormComponent = () => {
  const [formData, setFormData] = useState({
    _id: '',
    identifier: '',
    title: '',
    doi: '',
    license: '',
    sparql: [{
        access_url: '',
        title: '',
        description: {
           en: ''
        }
    }],
    full_download: [],
    website: '',
    domain: "cultural-heritage",
    contact_point: {
        name: '',
        email : '',
    },
    owner : {
        name: '',
        email : '',
    },
    keywords: [],
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
  const [doiValid, setDoiValid] = useState(true)
  const [showSparqlForm, setShowSparqlForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'doi') {
        setDoiValid(DOI_REGEX.test(value)); 
    }

    if (name === 'sparql-url' || name === 'sparql-title') {
        setFormData(prev => ({
          ...prev,
          sparql: {
            ...prev.sparql,
            [name.split('-')[1]]: value // split sparql-url into url and sparql-title into title
          }
        }));
      } else if (name.startsWith('full_download-')) {
        const [_, index, field] = name.split('-'); // e.g., resource-0-title, resource-0-url, resource-0-description
        const newResources = [...formData.full_download];
        newResources[index] = {
          ...newResources[index],
          [field]: value
        };
        setFormData(prev => ({
          ...prev,
          full_download: newResources
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setError(null);

    const formattedData = {
        ...formData,
        sparql: [{
          access_url: formData.sparql.access_url,
          title: formData.sparql.title,
          description: formData.sparql.description
        }],
        full_download: formData.full_download
    };

    if (!DOI_REGEX.test(formData.doi)) {
        setDoiValid(false);
        return;
    }
    

    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      await response.json();
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '', sparql: [], full_download: [], contact_point: '' });
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  const handleAddResource = () => {
    setFormData(prev => ({
      ...prev,
      full_download: [...prev.full_download, { title: '', download_url: '', description: '' }]
    }));
  };

  const handleRemoveResource = (index) => {
    const newResources = formData.full_download.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      full_download: newResources
    }));
  };

  return (
    <div className="container mt-3">

      {submitted && (
        <div className="alert alert-success" role="alert">
          Your message has been sent successfully!
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Dataset ID (max 10 characters) </label>
          <input
            type="text"
            className="form-control"
            id="identifier"
            name="identifier"
            maxLength="10"
            required
            value={formData.identifier}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter the an ID for the Dataset</div>
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Dataset Name</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter the dataset name.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">DOI</label>
          <input
            type="text"
            className={`form-control ${!doiValid && formData.doi ? 'is-invalid' : ''}`}
            id="doi"
            name="doi"
            placeholder='Example: 10.1234/abcd.efgh'
            value={formData.doi}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter a valid dataset DOI.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">License</label>
          <input
            type="text"
            className="form-control"
            id="license"
            name="license"
            placeholder='Better to use a URL'
            value={formData.license}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter the license.</div>
        </div>
        <div className="d-flex gap-3 mb-3">
        <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowSparqlForm(!showSparqlForm)}
        >
            {showSparqlForm ? 'Close' : 'Add SPARQL Endpoint'}
        </button>

        <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddResource}
        >
            Add one or more Data dump
        </button>
        </div>

        {/* SPARQL endpoint section */}
        {showSparqlForm && (
          <div className="border p-3 mt-3 rounded">
            <h5>SPARQL Endpoint</h5>
            <div className="mb-3">
              <label htmlFor="sparql-url" className="form-label">URL</label>
              <input
                type="url"
                className="form-control"
                id="sparql-url"
                name="sparql-url"
                value={formData.sparql.access_url}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid URL.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="sparql-title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="sparql-title"
                name="sparql-title"
                value={formData.sparql.title}
                onChange={handleChange}
              />
              <div className="invalid-feedback">Please enter the SPARQL endpoint title.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="sparql-description" className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                id="sparql-description"
                name="sparql-description"
                value={formData.sparql.description}
                onChange={handleChange}
              />
              <div className="invalid-feedback">Please enter the SPARQL endpoint description.</div>
            </div>
          </div>
        )}
        
        {/* full_download Section */}

        {formData.full_download.map((resource, index) => (
          <div key={index} className="border p-3 mt-3 rounded">
            <h5>Data dump {index + 1}</h5>

            <div className="mb-3">
              <label htmlFor={`full_download-${index}-title`} className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id={`full_download-${index}-title`}
                name={`full_download-${index}-title`}
                value={resource.title}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`full_download-${index}-download_url`} className="form-label">Download URL</label>
              <input
                type="url"
                className="form-control"
                id={`full_download-${index}-download_url`}
                name={`full_download-${index}-download_url`}
                value={resource.download_url}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`full_download-${index}-description`} className="form-label">Description</label>
              <textarea
                className="form-control"
                id={`full_download-${index}-description`}
                name={`full_download-${index}-description`}
                value={resource.description}
                onChange={handleChange}
              />
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleRemoveResource(index)}
            >
              Remove Resource
            </button>
          </div>
        ))}

        <div className="mb-3">
          <label htmlFor="website" className="form-label">Website</label>
          <input
            type="url"
            className="form-control"
            id="website"
            name="website"
            required
            value={formData.website}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter a valid email.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="triples" className="form-label">Number of triples</label>
          <input
            type="number"
            className="form-control"
            id="triples"
            name="triples"
            required
            value={formData.triples}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter a valid number.</div>
        </div>

        <div className="border p-3 mt-3 mb-3 rounded">
            <h5>Contact point</h5>
            <div className="mb-3">
              <label htmlFor="contact-point-name" className="form-label">Name</label>
              <input
                type="url"
                className="form-control"
                id="contact-point-name"
                name="contact-point-name"
                value={formData.contact_point.name}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid URL.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="contact-point-email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="contact-point-mail"
                name="contact-point-mail"
                value={formData.contact_point.email}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid e-mail.</div>
            </div>
        </div>

        <div className="border p-3 mt-3 mb-3 rounded">
            <h5>Dataset Author</h5>
            <div className="mb-3">
              <label htmlFor="owner-name" className="form-label">Name</label>
              <input
                type="url"
                className="form-control"
                id="owner-name"
                name="owner-name"
                value={formData.owner.name}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid URL.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="owner-email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="owner-mail"
                name="owner-mail"
                value={formData.owner.email}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid e-mail.</div>
            </div>
        </div>

        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  );
};

export default FormComponent;