import React from 'react';

const Model = ({ moveCount, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Congratulations!</h2>
                <p>You won in {moveCount} moves!</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Model;
