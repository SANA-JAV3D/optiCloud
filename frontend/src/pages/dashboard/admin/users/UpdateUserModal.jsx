import React, { useState } from 'react'
import { useUpdateUerRoleMutation } from '../../../../redux/features/auth/authApi';
import {
    XMarkIcon,
    UserIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const UpdateUserModal = ({ user, onClose, onRoleUpdate }) => {
    const [role, setRole] = useState(user.role);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [updateUerRole] = useUpdateUerRoleMutation();

    const handleUpdateRole = async () => {
        if (role === user.role) {
            showNotification('No changes to save', 'info');
            onClose();
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await updateUerRole({ userId: user?._id, role }).unwrap();
            showNotification('User role updated successfully!', 'success');
            onRoleUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update user role", error);
            setError(error.data?.message || 'Failed to update user role. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    };

    const getRoleIcon = (role) => {
        return role === 'admin' ? (
            <ShieldCheckIcon className="h-5 w-5" />
        ) : (
            <UserIcon className="h-5 w-5" />
        );
    };

    const getRoleColor = (role) => {
        return role === 'admin'
            ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
            : 'text-green-600 bg-green-50 border-green-200';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Close modal on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close modal on escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Edit User Role</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* User Info Card */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {user?.username || 'No username'}
                                </h3>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Joined {formatDate(user?.createdAt)}
                                </p>
                            </div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                {getRoleIcon(user.role)}
                                <span className="ml-1 capitalize">{user.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Current Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Email
                        </label>
                        <input
                            type="email"
                            value={user?.email}
                            readOnly
                            className="block w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Update Role
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="role"
                                    value="user"
                                    checked={role === 'user'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <div className="ml-3 flex items-center">
                                    <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">User</div>
                                        <div className="text-xs text-gray-500">Standard user permissions</div>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === 'admin'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <div className="ml-3 flex items-center">
                                    <ShieldCheckIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Admin</div>
                                        <div className="text-xs text-gray-500">Full administrative access</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Warning for Admin Role */}
                    {role === 'admin' && user.role !== 'admin' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Granting admin access will give this user full administrative privileges including the ability to manage other users.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Change Summary */}
                    {role !== user.role && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <div className="text-sm text-blue-700">
                                    <span className="font-medium">Role will be changed from </span>
                                    <span className="capitalize font-semibold">{user.role}</span>
                                    <span className="font-medium"> to </span>
                                    <span className="capitalize font-semibold">{role}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateRole}
                            disabled={isLoading || role === user.role}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateUserModal;