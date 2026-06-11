import React, { useEffect } from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo, 
  FiXCircle, 
  FiX,
  FiBell
} from 'react-icons/fi';

const Notification = ({ 
  type = 'info', 
  message, 
  onClose, 
  duration = 5000,
  title,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="h-5 w-5 text-green-400" />,
    error: <FiXCircle className="h-5 w-5 text-red-400" />,
    warning: <FiAlertCircle className="h-5 w-5 text-yellow-400" />,
    info: <FiInfo className="h-5 w-5 text-blue-400" />,
    default: <FiBell className="h-5 w-5 text-gray-400" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    default: 'bg-gray-50 border-gray-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
    default: 'text-gray-800'
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={`fixed z-50 max-w-sm w-full ${positions[position]} animate-slideIn`}>
      <div className={`${colors[type]} border rounded-lg shadow-lg overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {icons[type] || icons.default}
            </div>
            <div className="ml-3 w-0 flex-1">
              {title && (
                <p className={`text-sm font-medium ${textColors[type]} mb-1`}>
                  {title}
                </p>
              )}
              <p className={`text-sm ${textColors[type]}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className={`inline-flex rounded-md ${textColors[type]} hover:text-gray-500 focus:outline-none`}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {duration > 0 && (
          <div 
            className="h-1 bg-primary-500 animate-shrink"
            style={{ animationDuration: `${duration}ms` }}
          />
        )}
      </div>
    </div>
  );
};

// Toast container component
export const ToastContainer = ({ notifications, onClose }) => {
  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => onClose(notification.id)}
          position={notification.position || 'top-right'}
        />
      ))}
    </>
  );
};

// Alert component for inline notifications
export const Alert = ({ type = 'info', message, onClose, showIcon = true }) => {
  const icons = {
    success: <FiCheckCircle className="h-5 w-5 text-green-400" />,
    error: <FiXCircle className="h-5 w-5 text-red-400" />,
    warning: <FiAlertCircle className="h-5 w-5 text-yellow-400" />,
    info: <FiInfo className="h-5 w-5 text-blue-400" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`${colors[type]} border rounded-lg p-4`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          <p className={`text-sm ${textColors[type]}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md ${textColors[type]} hover:text-gray-500 focus:outline-none`}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Banner notification component
export const Banner = ({ type = 'info', message, onClose }) => {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`${colors[type]} text-white px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium">{message}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;

// Add animation styles to your index.css:
/*
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.animate-shrink {
  animation: shrink linear forwards;
}
*/