import React, { useState } from 'react';
import './App.css';

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleSaveSegmentClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSaveSuccess = () => {
    setShowPopup(false);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000); // Show message for 2 seconds
  };

  return (
    <div className="App">
      <button className="save-segment-button" onClick={handleSaveSegmentClick}>
        Save segment
      </button>
      {showPopup && <SaveSegmentPopup onClose={handleClosePopup} onSaveSuccess={handleSaveSuccess} setShowErrorMessage={setShowErrorMessage} />}
      {showSavedMessage && <SavedMessage />}
      {showErrorMessage && <ErrorMessage />}
    </div>
  );
}

const SaveSegmentPopup = ({ onClose, onSaveSuccess, setShowErrorMessage }) => {
  const [segmentName, setSegmentName] = useState('');
  const [selectedSchemas, setSelectedSchemas] = useState([]);
  const [availableSchemas, setAvailableSchemas] = useState([
    { label: 'First Name', value: 'first_name' },
    { label: 'Last Name', value: 'last_name' },
    { label: 'Gender', value: 'gender' },
    { label: 'Age', value: 'age' },
    { label: 'Account Name', value: 'account_name' },
    { label: 'City', value: 'city' },
    { label: 'State', value: 'state' }
  ]);

  const handleAddSchema = (schema) => {
    setSelectedSchemas([...selectedSchemas, schema]);
    setAvailableSchemas(availableSchemas.filter(s => s.value !== schema.value));
  };

  const handleRemoveSchema = (index) => {
    const removedSchema = selectedSchemas[index];
    setSelectedSchemas(selectedSchemas.filter((_, i) => i !== index));
    setAvailableSchemas([...availableSchemas, removedSchema]);
  };

  const handleSave = async () => {
    const hasName = selectedSchemas.some(schema => schema.value === 'first_name' || schema.value === 'last_name');
    const hasAge = selectedSchemas.some(schema => schema.value === 'age');

    if (!hasName || !hasAge) {
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 2000); // Show error message for 2 seconds
      return;
    }

    const segmentData = {
      segment_name: segmentName,
      schema: selectedSchemas.map(schema => ({ [schema.value]: schema.label }))
    };
    console.log(segmentData);

    try {
      const response = await fetch('your-server-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(segmentData),
      });
      const result = await response.json();
      console.log('Server response:', result);
    } catch (error) {
      console.error('Error saving segment:', error);
    }

    onSaveSuccess();
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
       <nav className='nav'>
        <button onClick={onClose} className="back-button">&larr; View Audience</button>
        </nav> 
        <h2 className="popup-title">Enter the name of segment</h2>
        <input
          type="text"
          placeholder="Name of the segment"
          value={segmentName}
          onChange={(e) => setSegmentName(e.target.value)}
          className="segment-name-input"
        />
        <p className="instruction-text">To save your segment, you need to add the schemas to build the query.</p>

        <div className="schema-box">
          {selectedSchemas.map((schema, index) => (
            <div key={index} className="schema-item">
              <select
                className="schema-select"
                value={schema.value}
                onChange={(e) => handleRemoveSchema(index)}
              >
                <option value={schema.value}>{schema.label}</option>
              </select>
              <button className="remove-schema-button" onClick={() => handleRemoveSchema(index)}> - </button>
            </div>
          ))}
        </div>
        <div className="add-schema-row">
            <select
              onChange={(e) => handleAddSchema(JSON.parse(e.target.value))}
              defaultValue=""
              className="schema-select"
            >
              <option value="" disabled>Add schema to segment</option>
              {availableSchemas.map((schema) => (
                <option key={schema.value} value={JSON.stringify(schema)}>
                  {schema.label}
                </option>
              ))}
            </select>
          </div>
        <button className="add-schema-button" onClick={() => handleAddSchema(JSON.parse('{"label": "New Schema", "value": "new_schema"}'))}>
              + Add new schema
            </button>
           
        <div className="action-buttons">
          <button className="save-button" onClick={handleSave}>Save the Segment</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const SavedMessage = () => (
  <div className="saved-message">
    Segment saved
  </div>
);

const ErrorMessage = () => (
  <div className="error-message">
    Name and Age are required!
  </div>
);

export default App;
