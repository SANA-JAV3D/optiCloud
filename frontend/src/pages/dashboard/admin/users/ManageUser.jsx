import React, { useState } from 'react'
import { useDeleteUserMutation, useGetUserQuery } from '../../../../redux/features/auth/authApi'
import { Link } from 'react-router-dom';
import UpdateUserModal from './UpdateUserModal';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    UserPlusIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const ManageUser = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    const { data: users = [], error, isLoading, refetch } = useGetUserQuery();

    const [deleteUser] = useDeleteUserMutation();

    // Filter users based on search term and role
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = filterRole === '' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (id, email) => {
        if (window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
            try {
                await deleteUser(id).unwrap();
                showNotification("User deleted successfully!", 'success');
                refetch();
            } catch (error) {
                console.error("Failed to delete user", error);
                showNotification("Failed to delete user", 'error');
            }
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
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
        switch (role) {
            case 'admin':
                return <ShieldCheckIcon className="h-4 w-4" />;
            case 'user':
                return <UserIcon className="h-4 w-4" />;
            default:
                return <UserIcon className="h-4 w-4" />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-indigo-100 text-indigo-800';
            case 'user':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                    <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading users</h3>
                    <p className="text-gray-600 mb-4">Something went wrong while fetching the user data.</p>
                    <button
                        onClick={() => refetch()}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="px-6 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="mb-6 lg:mb-0">
                                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                                <p className="mt-2 text-gray-600">
                                    Manage user accounts and permissions
                                </p>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-blue-600 text-sm font-medium">Total Users</p>
                                        <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                        <p className="text-indigo-600 text-sm font-medium">Admins</p>
                                        <p className="text-2xl font-bold text-indigo-900">
                                            {users.filter(u => u.role === 'admin').length}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-green-600 text-sm font-medium">Regular Users</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {users.filter(u => u.role === 'user').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                                    <UserPlusIcon className="h-5 w-5 mr-2" />
                                    Add New User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users by email or username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div className="sm:w-48">
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admins</option>
                                    <option value="user">Users</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="mt-4 text-sm text-gray-600">
                            Showing {currentUsers.length} of {filteredUsers.length} users
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentUsers.map((user, index) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <UserIcon className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.username || 'No username'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                <span className="ml-1 capitalize">{user.role}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
                                                    title="Edit user"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id, user.email)}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                                    title="Delete user"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center space-x-1">
                                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                            const pageNumber = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                                            if (pageNumber > totalPages) return null;

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${currentPage === pageNumber
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <UsersIcon className="mx-auto h-24 w-24" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || filterRole ? 'Try adjusting your search or filter criteria.' : 'There are no users to display.'}
                        </p>
                        {(searchTerm || filterRole) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterRole('');
                                }}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <UpdateUserModal
                    user={selectedUser}
                    onClose={handleCloseModal}
                    onRoleUpdate={refetch}
                />
            )}
        </div>
    );
};

export default ManageUser;