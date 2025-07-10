import React from 'react';

function sanitizeFilename(filename) {
return filename
    .replace(/[\/\\:*?"<>|]/g, '_') 
    .replace(/\s+/g, '_') 
    .replace(/^\.+/, '') 
    .replace(/[^a-zA-Z0-9_\-.]/g, '')
    .substring(0, 255);
}

const prepareDataForExport = (data) => {
    return data.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((key) => {
        const value = row[key];
        if (React.isValidElement(value)) {

          const anchor = value.props?.href || '';
          newRow[key] = anchor || ''; 
        } else if (typeof value === 'object' && value !== null) {

          newRow[key] = JSON.stringify(value);
        } else {
          newRow[key] = value; 
        }
      });
      return newRow;
    });
  };

function isValidUrl(value){
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    return urlRegex.test(value);
}

function renderValueAsLink(value) {
    value = value.replace('#','')
    if (isValidUrl(value)) {
      return <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer">{value}</a>;
    }
    return value;
  }


export {sanitizeFilename, prepareDataForExport, renderValueAsLink}