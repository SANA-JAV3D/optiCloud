import React, { useState } from 'react'
import { useUpdateOrderStatusMutation } from '../../../../redux/features/orders/orderApi';
import {
    XMarkIcon,
    ShoppingBagIcon,
    ClockIcon,
    DocumentDuplicateIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
    UserIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const UpdateOrderModal = ({ order, isOpen, onClose, onUpdate }) => {
    const [status, setStatus] = useState(order?.status);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [updateOrderStatus] = useUpdateOrderStatusMutation();

    const statusOptions = [
        {
            value: 'pending',
            label: 'Pending',
            icon: ClockIcon,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            description: 'Order received and awaiting processing'
        },
        {
            value: 'processing',
            label: 'Processing',
            icon: DocumentDuplicateIcon,
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            description: 'Order is being prepared'
        },
        {
            value: 'shipped',
            label: 'Shipped',
            icon: TruckIcon,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            description: 'Order has been shipped to customer'
        },
        {
            value: 'completed',
            label: 'Completed',
            icon: CheckCircleIcon,
            color: 'text-green-600 bg-green-50 border-green-200',
            description: 'Order delivered and completed'
        },
        {
            value: 'cancelled',
            label: 'Cancelled',
            icon: XCircleIcon,
            color: 'text-red-600 bg-red-50 border-red-200',
            description: 'Order has been cancelled'
        }
    ];

    const handleUpdateOrderStatus = async () => {
        if (status === order?.status) {
            showNotification('No changes to save', 'info');
            onClose();
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await updateOrderStatus({ id: order?._id, status }).unwrap();
            showNotification('Order status updated successfully!', 'success');
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update order status:", error);
            setError(error.data?.message || 'Failed to update order status. Please try again.');
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateTotal = (products) => {
        if (!products || products.length === 0) return 0;
        return products.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const getCurrentStatusOption = () => {
        return statusOptions.find(option => option.value === order?.status);
    };

    const getNewStatusOption = () => {
        return statusOptions.find(option => option.value === status);
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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Update Order Status</h2>
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
                    {/* Order Info Card */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <ShoppingBagIcon className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Order #{order?.orderId}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <UserIcon className="h-4 w-4 mr-1" />
                                        {order?.email}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        {formatDate(order?.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center text-lg font-semibold text-gray-900">
                                    <CurrencyDollarIcon className="h-5 w-5 mr-1 text-gray-400" />
                                    ₹{order?.amount}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {order?.products?.length || 0} items
                                </div>
                            </div>
                        </div>

                        {/* Products Summary */}
                        {/* {order?.products && order.products.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
                                <div className="space-y-2">
                                    {order.products.slice(0, 3).map((product, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                {product.name} × {product.quantity}
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                ${(product.price * product.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    {order.products.length > 3 && (
                                        <div className="text-sm text-gray-500 italic">
                                            +{order.products.length - 3} more items
                                        </div>
                                    )}
                                </div>
                            </div>
                        )} */}
                    </div>

                    {/* Current Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Current Status
                        </label>
                        {getCurrentStatusOption() && (
                            <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getCurrentStatusOption().color}`}>
                                {/* {<getCurrentStatusOption().icon className="h-5 w-5 mr-2" />} */}
                                <span className="font-medium">{getCurrentStatusOption().label}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Update to New Status
                        </label>
                        <div className="space-y-3">
                            {statusOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={option.value}
                                        checked={status === option.value}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="h-4 w-4 align-middle text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-1"
                                    />
                                    <div className="ml-3 flex items-center">
                                        <option.icon className={`h-5 w-5 mr-3 ${option.value === status ? option.color.split(' ')[0] : 'text-gray-400'}`} />
                                        <div>
                                            <div className={`text-sm font-medium ${option.value === status ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {option.label}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {option.description}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Change Summary */}
                    {status !== order?.status && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <div className="text-sm text-blue-700">
                                    <span className="font-medium">Status will be changed from </span>
                                    <span className="capitalize font-semibold">{getCurrentStatusOption()?.label}</span>
                                    <span className="font-medium"> to </span>
                                    <span className="capitalize font-semibold">{getNewStatusOption()?.label}</span>
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
                            onClick={handleUpdateOrderStatus}
                            disabled={isLoading || status === order?.status}
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
                                'Update Status'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateOrderModal;
