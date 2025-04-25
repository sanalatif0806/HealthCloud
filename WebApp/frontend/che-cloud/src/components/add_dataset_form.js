import React, { useState } from 'react';
import { base_url } from '../api';

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
    newKeyword: "",
    Image: '',
    example: [],
    other_download: [],
    namespace: '',
    links: [], //todo
    time: '',
    triples: 0,
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
      } 
      else if (name.startsWith('example-')){
        const [_, index, field] = name.split('-'); 
        const newResources = [...formData.example];
        newResources[index] = {
          ...newResources[index],
          [field]: value
        };
        setFormData(prev => ({
          ...prev,
          example: newResources
        }));
      }
      else if (name.startsWith('other-')){
        const [_, index, field] = name.split('-'); 
        const newResources = [...formData.other_download];
        newResources[index] = {
          ...newResources[index],
          [field]: value
        };
        setFormData(prev => ({
          ...prev,
          other_download: newResources
        }));
      }
      else if (name === 'sub-category' && value) {
        setFormData(prev => {
          const oldCategory = prev.category;
      
          let updatedKeywords = prev.keywords.filter(k => k !== oldCategory);
      
          if (!updatedKeywords.includes(value) && value) {
            updatedKeywords = [...updatedKeywords, value];
          }
      
          return {
            ...prev,
            category: value,
            keywords: updatedKeywords
          };
        });
      } else if (name.startsWith('contact-point-')) {
        const field = name.split('contact-point-')[1];
        setFormData(prev => ({
          ...prev,
          contact_point: {
            ...prev.contact_point,
            [field]: value
          }
        }));
      } else if (name.startsWith('owner-')) {
        const field = name.split('owner-')[1];
        setFormData(prev => ({
          ...prev,
          owner: {
            ...prev.owner,
            [field]: value
          }
        }));
      }
      else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
  };

  const handleAddKeyword = () => {
    const newKw = formData.newKeyword.trim();
    if (newKw && !formData.keywords.includes(newKw)) {
      setFormData((prevData) => ({
        ...prevData,
        keywords: [...prevData.keywords, newKw],
        newKeyword: "",
      }));
    }
  };
  
  const handleRemoveKeyword = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      keywords: prevData.keywords.filter((_, i) => i !== index),
    }));
  };

  const handleKeywordKeyDown = (e) => {
    const key = e.key;
  
    if (key === 'Enter' || key === ',' || key === ' ') {
      e.preventDefault(); // prevent form submit or unwanted input
      const newKw = formData.newKeyword.trim();
  
      if (newKw && !formData.keywords.includes(newKw)) {
        setFormData((prevData) => ({
          ...prevData,
          keywords: [...prevData.keywords, newKw],
          newKeyword: "",
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          newKeyword: "",
        }));
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      console.log('Form is invalid');
      form.classList.add('was-validated'); 
      return;
    }
    setSubmitted(false);
    setError(null);

    const formattedData = {
        ...formData,
        sparql: [{
          access_url: formData.sparql.access_url,
          title: formData.sparql.title,
          description: formData.sparql.description
        }],
        full_download: formData.full_download,
        example: formData.example,
        other_download: formData.other_download,
    };

    if (!DOI_REGEX.test(formData.doi) && formData.doi !== '') {
        setDoiValid(false);
        return;
    }

    try {
      const response = await fetch(`${base_url}/monitoring_requests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      await response.json();
      setSubmitted(true);
      setFormData({ title: '', email: '', message: '', sparql: [], full_download: [], contact_point: {name:'',email:''}, keywords: [], example: [], other_download: [] });
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


  const handleAddExample = () => {
    setFormData(prev => ({
      ...prev,
      example: [...prev.example, { title: '', access_url: '', description: '' }]
    }));
  };

  const handleRemoveExample = (index) => {
    const newResources = formData.example.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      example: newResources
    }));
  };

  const handleAddOther = () => {
    setFormData(prev => ({
      ...prev,
      other_download: [...prev.other_download, { title: '', access_url: '', description: '' }]
    }));
  };

  const handleRemoveOther = (index) => {
    const newResources = formData.other_download.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      other_download: newResources
    }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
  
    setFormData((prevData) => {
      const keywords = [...prevData.keywords];
  
      // Add "ontology" if selected and not already there
      if (value === "ontology" && !keywords.includes("ontology")) {
        keywords.push("ontology");
      }
  
      // Remove it if switching to dataset
      if (value === "dataset") {
        const index = keywords.indexOf("ontology");
        if (index > -1) {
          keywords.splice(index, 1);
        }
      }
  
      return {
        ...prevData,
        keywords,
      };
    });
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
          <label htmlFor="name" className="form-label">Dataset ID (min 5 max 10 characters) </label>
          <input
            type="text"
            className="form-control"
            id="identifier"
            name="identifier"
            maxLength="10"
            minLength="5"
            required
            value={formData.identifier}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter an ID for the Dataset</div>
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
            placeholder='e.g.: 10.1234/abcd.efgh'
            value={formData.doi}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter a valid DOI.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">License</label>
          <input
            type="text"
            className="form-control"
            id="license"
            name="license"
            placeholder='A link leading to the license is recommended, e.g.: https://creativecommons.org/licenses/by/4.0/'
            value={formData.license}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter the license.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="website" className="form-label">Website</label>
          <input
            type="url"
            className="form-control"
            id="website"
            name="website"
            placeholder='e.g.: https://example.com'
            required
            value={formData.website}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter a valid website URL.</div>
        </div>

        <div className="mb-3">
          <label htmlFor="triples" className="form-label">Number of triples</label>
          <input
            type="number"
            min="1"
            className="form-control"
            id="triples"
            name="triples"
            value={formData.triples}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter a number of triples higher than 0.</div>
        </div>

        <div className="border p-3 mt-3 mb-3 rounded">
            <h5>Contact point</h5>
            <div className="mb-3">
              <label htmlFor="contact-point-name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="contact-point-name"
                name="contact-point-name"
                value={formData.contact_point.name}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid Name.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="contact-point-email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="contact-point-email"
                name="contact-point-email"
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
                type="text"
                className="form-control"
                id="owner-name"
                name="owner-name"
                value={formData.owner.name}
                onChange={handleChange}
              />
              <div className="invalid-feedback">Please enter a valid Name.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="owner-email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="owner-email"
                name="owner-email"
                value={formData.owner.email}
                onChange={handleChange}
              />
              <div className="invalid-feedback">Please enter a valid e-mail address.</div>
            </div>
        </div>
        {/* Keywords section */ }
        <div className="mb-3">
          <label htmlFor="keywords" className="form-label">Keywords</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {formData.keywords.map((keyword, index) => (
              <span key={index} className="badge bg-primary d-flex align-items-center">
                {keyword}
                <button
                  type="button"
                  className="btn-close btn-close-white btn-sm ms-2"
                  aria-label="Remove"
                  onClick={() => handleRemoveKeyword(index)}
                ></button>
              </span>
            ))}
        </div>

        <div className="input-group">
          <input
            type="text"
            className="form-control"
            id="newKeyword"
            name="newKeyword"
            value={formData.newKeyword}
            onChange={handleChange}
            onKeyDown={handleKeywordKeyDown}
            placeholder="Type a keyword"
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleAddKeyword}
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-3">
          <label htmlFor="website" className="form-label">Namespace</label>
          <input
            type="url"
            className="form-control"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
          <div className="invalid-feedback">Please enter a valid namespace.</div>
      </div>

      <div className="mb-3">
        <label className="form-label d-block">Type <span className="text-danger">*</span></label>

        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="resourceType"
            id="dataset"
            value="dataset"
            checked={formData.keywords.indexOf("ontology") === -1}
            onChange={handleTypeChange}
            required
          />
          <label className="form-check-label" htmlFor="dataset">Dataset</label>
        </div>

        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="resourceType"
            id="ontology"
            value="ontology"
            checked={formData.keywords.indexOf("ontology") > -1}
            onChange={handleTypeChange}
            required
          />
          <label className="form-check-label" htmlFor="ontology">Ontology</label>
        </div>
      </div>

      <div className="mb-3">

      <label htmlFor="sub-category" className="form-label">Cultural Heritage sub-category <span className="text-danger">*</span></label>
      <select
        className="form-select"
        id="sub-category"
        name="sub-category"
        value={formData.category}
        onChange={handleChange}
        required
      >
        <option value="">-- Select a sub-category --</option>
        <option value="ch-tangible">Tangible</option>
        <option value="ch-intangible">Intangible</option>
        <option value="ch-natural">Natural</option>
        <option value="ch-generic">Generic</option>
      </select>
      <div className="invalid-feedback">Please enter one sub-category.</div>
    </div>

    <div className="d-flex gap-3 mb-4">
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
        <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddExample}
        >
            Add one or more Example resource
        </button>
        <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddOther}
        >
            Add one or more Other Download resource
        </button>
        </div>

         {/* SPARQL endpoint section */}
        {showSparqlForm && (
          <div className="border p-3 mt-3 mb-4 rounded">
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
          <div key={index} className="border p-3 mt-3 mb-4 rounded">
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
              <div className="invalid-feedback">Please enter a valid URL.</div>
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

        {/* Example Section */}

        {formData.example.map((resource, index) => (
          <div key={index} className="border p-3 mt-3 mb-4 rounded">
            <h5>Example {index + 1}</h5>

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
              <label htmlFor={`example-${index}-access_url`} className="form-label">Access URL</label>
              <input
                type="url"
                className="form-control"
                id={`example-${index}-access_url`}
                name={`example-${index}-access_url`}
                value={resource.download_url}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid URL.</div>
            </div>

            <div className="mb-3">
              <label htmlFor={`example-${index}-description`} className="form-label">Description</label>
              <textarea
                className="form-control"
                id={`example-${index}-description`}
                name={`example-${index}-description`}
                value={resource.description}
                onChange={handleChange}
              />
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleRemoveExample(index)}
            >
              Remove Resource
            </button>
          </div>
        ))}

        {/* Other download section */}

        {formData.other_download.map((resource, index) => (
          <div key={index} className="border p-3 mt-3 mb-4 rounded">
            <h5>Other Download {index + 1}</h5>

            <div className="mb-3">
              <label htmlFor={`other_download-${index}-title`} className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id={`other_download-${index}-title`}
                name={`other_download-${index}-title`}
                value={resource.title}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`other_download-${index}-access_url`} className="form-label">Access URL</label>
              <input
                type="url"
                className="form-control"
                id={`other_download-${index}-access_url`}
                name={`other_download-${index}-access_url`}
                value={resource.download_url}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">Please enter a valid URL.</div>
            </div>

            <div className="mb-3">
              <label htmlFor={`other_download-${index}-description`} className="form-label">Description</label>
              <textarea
                className="form-control"
                id={`other_download-${index}-description`}
                name={`other_download-${index}-description`}
                value={resource.description}
                onChange={handleChange}
              />
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleRemoveOther(index)}
            >
              Remove Resource
            </button>
          </div>
        ))}

        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  );
};

export default FormComponent;