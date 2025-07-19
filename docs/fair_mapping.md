<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
</script>

## FAIR Evaluation Table

| ID     | FAIR Principle | Input       | Quality dimension | Monitored aspect                                      | Scoring function |
|--------|----------------|-------------|-------------------|-------------------------------------------------------|------------------|
| F1-M   | F1             | Metadata    | Availability      | Unique and persistent ID                              | 1, dataset registered in a search engine that provides a persistent DOI<br>0, otherwise |
| F1-D   | F1             | Data        | Availability      | URIs dereferenceability                               | $\text{Dereferenceability}(U_g^D) = \frac{|\text{Dereferenceable URIs}|}{|U_g^D|}, \text{ with } |U_g^D| = 5000$ URIs used as subjects |
| F2a-M  | F2             | Metadata    | Availability      | Metadata via standard primary sources                 | 1, dataset attached to a SPARQL endpoint, registered in a searchable search engine, or described via VoID/DCAT<br>0, otherwise |
| F2b-M  | F2             | Metadata    | Availability      | Metadata availability for all attributes in FAIR score | $\frac{\text{Covered metadata attributes}}{\text{Required metadata attributes}}$ |
| F3-M   | F3             | Metadata    | Availability      | Data referrable via a DOI                             | 1, metadata attach DOI(s) to data<br>0, otherwise |
| F4-M   | F4             | Metadata    | Availability      | Metadata registered in a searchable engine            | 1, dataset registered in any search engine<br>0, otherwise |
| A1.1-D | A1.1           | Data        | Availability      | Working access point(s)                               | 1, operational SPARQL endpoint or accessible dump(s)<br>0.5, accessible but not operational<br>0, otherwise |
| A1.1-M | A1.1           | Metadata    | Availability      | Metadata via working primary sources                  | 1, primary sources from F2a-M contain any metadata<br>0, otherwise |
| A1.2   | A1.2           | (Meta)data  | Security          | Authentication & HTTPS support                        | 1, security requirements discoverable via SPARQL query<br>0, otherwise |
| A2-M   | A2             | Metadata    | Availability      | Registered in search engines                          | 1, dataset registered in any search engine<br>0, otherwise |
| II-D   | II             | Data        | Interoperability  | Standard & open representation format                 | 1, data dump(s) have valid mediatypes or ontologies in OWL/RDF(S)<br>0, otherwise |
| II-M   | II             | Metadata    | Interoperability  | Metadata with VoID/DCAT predicates                    | 1, metadata published using VoID/DCAT<br>0, otherwise |
| I2     | I2             | (Meta)data  | Verifiability     | Use of FAIR vocabularies                              | $\frac{\#\text{FAIR vocabularies}}{\#\text{all vocabularies}}$ |
| I3-D   | I3             | Data        | Interlinking      | Degree of connection                                  | 1, dataset contains a link to another dataset<br>0, otherwise |
| R1.1   | R1.1           | (Meta)data  | Licensing         | License via any primary source                        | 1, license explicitly reported<br>0, otherwise |
| R1.2   | R1.2           | (Meta)data  | Verifiability     | Publisher details                                     | 1, publisher info explicitly reported<br>0, otherwise |
| R1.3-D | R1.3           | Data        | Reusability       | Standardized data organization                        | 1, SPARQL endpoint or dump(s) with valid mediatypes or OWL/RDF(S)<br>0, otherwise |
| R1.3-M | R1.3           | Metadata    | Reusability       | Metadata with VoID/DCAT                              | Same as II-M |