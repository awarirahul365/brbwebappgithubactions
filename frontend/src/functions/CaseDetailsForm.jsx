import React, { useState } from 'react';

function CaseDetailsForm({ selectedTab, details, onSubmit }) {
    const [inputValue, setInputValue] = useState('');

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = () => {
        const updates = {};
        updates[selectedTab] = inputValue;
        onSubmit(updates);
    };

    return (
        <div>
            <h2>{`Change ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}`}</h2>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder={details[selectedTab]}
            />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default CaseDetailsForm;
