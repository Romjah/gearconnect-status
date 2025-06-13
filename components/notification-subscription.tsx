import React, { useState } from 'react';
import { Bell, Mail, X } from 'lucide-react';

const NotificationSubscription: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => {
          setIsOpen(false);
          setIsSubscribed(false);
        }, 2000);
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="Subscribe to notifications"
      >
        <Bell className="h-5 w-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Get Notified
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSubscribed ? (
              <div className="text-center py-4">
                <div className="text-green-600 mb-2">
                  <Mail className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-green-600 font-medium">
                  Successfully subscribed!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You'll receive email notifications for incidents and updates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-gray-600 mb-4">
                  Get email notifications when we create, update, or resolve incidents.
                </p>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  We'll only send you important updates about system status. You can unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationSubscription; 