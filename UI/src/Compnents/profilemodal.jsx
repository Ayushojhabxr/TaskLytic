import React, { useState, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Badge, X, Edit3, Copy, Check } from 'lucide-react';

const UserProfileModal = ({ isOpen, onClose, internProfile }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(internProfile._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [internProfile]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !internProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {internProfile.firstName} {internProfile.lastName}
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full  text-blue-600 bg-white bg-opacity-20  text-sm font-medium">
              <Badge className="w-4 h-4 mr-2" />
              {internProfile.role.charAt(0).toUpperCase() + internProfile.role.slice(1)}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Address</p>
                  <p className="text-gray-900 font-semibold break-all">{internProfile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone Number</p>
                  <p className="text-gray-900 font-semibold">{internProfile.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-900 font-semibold capitalize">{internProfile.address}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Username</p>
                  <p className="text-gray-900 font-semibold">{internProfile.userName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
                <p className="text-gray-900 font-semibold">{formatDate(internProfile.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">User ID</p>
                <div className="flex items-center">
                  <p className="text-gray-900 font-mono text-sm mr-2 truncate max-w-[120px]">
                    {internProfile._id}
                  </p>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-white transition-colors duration-200"
                    title="Copy ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
           
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




export default UserProfileModal;