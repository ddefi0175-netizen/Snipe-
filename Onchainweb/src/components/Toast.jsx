
import React, { useState, useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 5000); // Auto-close after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!isVisible) return null;

    const baseClasses = 'toast';
    const typeClasses = {
        success: 'toast-success',
        error: 'toast-error',
        info: 'toast-info',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
            <p>{message}</p>
            <button onClick={() => setIsVisible(false)} className="close-button">&times;</button>
        </div>
    );
};

export default Toast;
