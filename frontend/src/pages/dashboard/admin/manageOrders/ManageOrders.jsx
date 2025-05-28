import React, { useState } from 'react'
import { useDeleteOrderMutation, useGetAllOrdersQuery } from '../../../../redux/features/orders/orderApi'
import { formatDate } from '../../../../utils/formateDate';
import { Link } from 'react-router-dom';
import UpdateOrderModal from './UpdateOrderModal';
// import ProductDetailsModal from './OrderProductDetailModal';
import {
    ShoppingBagIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    TruckIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const ManageOrders = () => {
    const { data: orders = [], error, isLoading, refetch } = useGetAllOrdersQuery();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);

    // Product Details Modal states
    const [selectedOrderProducts, setSelectedOrderProducts] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const [deleteOrder] = useDeleteOrderMutation();

    // Filter orders based on search term and status
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleViewProducts = (order) => {
        setSelectedOrderProducts(order.products);
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setSelectedOrderProducts(null);
    };

    const handleDeleteOrder = async (orderId, orderNumber) => {
        if (window.confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`)) {
            try {
                await deleteOrder(orderId).unwrap();
                showNotification("Order deleted successfully", 'success');
                refetch();
            } catch (error) {
                console.error("Failed to delete order:", error);
                showNotification("Failed to delete order", 'error');
            }
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="h-4 w-4" />;
            case 'processing':
                return <DocumentDuplicateIcon className="h-4 w-4" />;
            case 'shipped':
                return <TruckIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'cancelled':
                return <XCircleIcon className="h-4 w-4" />;
            default:
                return <ClockIcon className="h-4 w-4" />;
        }
    };

    const calculateTotal = (products) => {
        if (!products || products.length === 0) return 0;
        return products.reduce((total, item) => total + (item.amount), 0).toFixed(2);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                    <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
                    <p className="text-gray-600 mb-4">Something went wrong while fetching the orders.</p>
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
                                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                                <p className="mt-2 text-gray-600">
                                    Track and manage customer orders
                                </p>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                                        <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-yellow-600 text-sm font-medium">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-900">
                                            {orders.filter(o => o.status === 'pending').length}
                                        </p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                        <p className="text-indigo-600 text-sm font-medium">Shipped</p>
                                        <p className="text-2xl font-bold text-indigo-900">
                                            {orders.filter(o => o.status === 'shipped').length}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-green-600 text-sm font-medium">Completed</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {orders.filter(o => o.status === 'completed').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
                                </div>
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
                                        placeholder="Search orders by ID or customer email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="sm:w-48">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="mt-4 text-sm text-gray-600">
                            Showing {currentOrders.length} of {filteredOrders.length} orders
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Products
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentOrders.map((order, index) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <DocumentDuplicateIcon className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{order.orderId}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Order ID
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Customer
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                // onClick={() => handleViewProducts(order)}
                                                className="text-left hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors group"
                                            >
                                                <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                                                    {order.products?.length || 0} items
                                                </div>
                                                {/* <div className="text-sm text-indigo-600 group-hover:text-indigo-800 flex items-center">
                                                    <EyeIcon className="h-3 w-3 mr-1" />
                                                    View details
                                                </div> */}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm font-medium text-gray-900">
                                                <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                ₹{order.amount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="ml-1 capitalize">{order.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.updatedAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditOrder(order)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
                                                    title="Edit order"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id, order.orderId)}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                                    title="Delete order"
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
                                    Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
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
                {filteredOrders.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <ShoppingBagIcon className="mx-auto h-24 w-24" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || filterStatus ? 'Try adjusting your search or filter criteria.' : 'No orders have been placed yet.'}
                        </p>
                        {(searchTerm || filterStatus) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('');
                                }}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Update Order Modal */}
            {isModalOpen && selectedOrder && (
                <UpdateOrderModal
                    order={selectedOrder}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onUpdate={refetch}
                />
            )}

            {/* Product Details Modal */}
            {/* {isProductModalOpen && selectedOrderProducts && (
                <ProductDetailsModal
                    products={selectedOrderProducts}
                    isOpen={isProductModalOpen}
                    onClose={handleCloseProductModal}
                />
            )} */}
        </div>
    );
};

export default ManageOrders;