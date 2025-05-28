import React, { useState } from 'react'
import { useDeleteProductMutation, useFetchAllProductsQuery, useUpdateStockMutation } from '../../../../redux/features/products/productsApi'
import { formatDate } from '../../../../utils/formateDate';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

const ManageProduct = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(12)
    const [stockQuantity, setStockQuantity] = useState({});

    const { data: { products = [], totalPages, totalProducts } = {}, isLoading, error, refetch } = useFetchAllProductsQuery({
        category: '',
        minPrice: '',
        maxPrice: '',
        page: currentPage,
        limit: productsPerPage,
    })

    // pagination
    const startProduct = (currentPage - 1) * productsPerPage + 1;
    const endProduct = startProduct + products.length - 1;

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    const [deleteProduct] = useDeleteProductMutation()
    const [updateStock] = useUpdateStockMutation()

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id).unwrap();
                alert("Product deleted successfully")
                await refetch()
            } catch (error) {
                console.error("Error deleting product", error)
                alert("Failed to delete product")
            }
        }
    }

    const handleStockUpdate = async (productId, action) => {
        const quantity = stockQuantity[productId] || 1;
        try {
            await updateStock({ id: productId, quantity: parseInt(quantity), action }).unwrap();
            await refetch();
            setStockQuantity(prev => ({ ...prev, [productId]: 1 }));
        } catch (error) {
            console.error('Failed to update stock:', error);
            alert('Failed to update stock');
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
        if (stock <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-50' };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">Error loading products</div>
                    <button
                        onClick={() => refetch()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Retry
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                                <p className="mt-2 text-gray-600">
                                    Showing {startProduct} to {endProduct} of {totalProducts} products
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <Link
                                    to="/dashboard/add-product"
                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add New Product
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Stock Management
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product, index) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    return (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-12 w-12 flex-shrink-0">
                                                        <img
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                            // src={product.url || '/placeholder-image.jpg'}
                                                            src={product?.url.split('/').length <= 1 ? `/assets/${product?.url}` : product?.url}
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {product._id?.slice(-8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    ${product.price}
                                                </div>
                                                {product.oldPrice && (
                                                    <div className="text-sm text-gray-500 line-through">
                                                        ${product.oldPrice}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {product.stock} units
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color} mt-1`}>
                                                        {stockStatus.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={stockQuantity[product._id] || 1}
                                                        onChange={(e) => setStockQuantity(prev => ({
                                                            ...prev,
                                                            [product._id]: e.target.value
                                                        }))}
                                                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                    <button
                                                        onClick={() => handleStockUpdate(product._id, 'increase')}
                                                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                                        title="Increase stock"
                                                    >
                                                        <ArrowUpIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStockUpdate(product._id, 'decrease')}
                                                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                                        title="Decrease stock"
                                                    >
                                                        <ArrowDownIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(product.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        to={`/shop/${product._id}`}
                                                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                                        title="View product"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        to={`/dashboard/update-product/${product._id}`}
                                                        className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
                                                        title="Edit product"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                                        title="Delete product"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                    Showing <span className="font-medium">{startProduct}</span> to{' '}
                                    <span className="font-medium">{endProduct}</span> of{' '}
                                    <span className="font-medium">{totalProducts}</span> products
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
                                        {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                                            let pageNumber;
                                            if (totalPages <= 7) {
                                                pageNumber = index + 1;
                                            } else if (currentPage <= 4) {
                                                pageNumber = index + 1;
                                            } else if (currentPage >= totalPages - 3) {
                                                pageNumber = totalPages - 6 + index;
                                            } else {
                                                pageNumber = currentPage - 3 + index;
                                            }

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
                {products.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">Get started by adding your first product to the store.</p>
                        <Link
                            to="/dashboard/add-product"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Your First Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManageProduct