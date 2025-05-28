import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFetchProductByIdQuery, useUpdateProductMutation, useUpdateStockMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getBaseUrl } from '../../../../utils/baseURL';
import {
    PhotoIcon,
    CurrencyDollarIcon,
    TagIcon,
    DocumentTextIcon,
    CubeIcon,
    PencilIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    CloudArrowUpIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const categories = [
    { label: 'Select Category', value: '' },
    { label: 'Spherical Singlet Lens', value: 'spherical' },
    { label: 'Aspheric Lens', value: 'aspheric' },
    { label: 'Achromatic Lens', value: 'achromatic' },
    { label: 'Cylindrical Lens', value: 'cylindrical' },
    { label: 'Powell Lens', value: 'powell' },
    { label: 'Prism', value: 'prism' },
];

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [product, setProduct] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        url: '',
        stock: 0
    });

    const [newImage, setNewImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [stockQuantity, setStockQuantity] = useState(1);

    const { data: productData, isLoading: isProductLoading, error: fetchError, refetch } = useFetchProductByIdQuery(id);
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [updateStock] = useUpdateStockMutation();

    const { name, category, description, url: imageURL, price, stock } = productData?.product || {};

    useEffect(() => {
        if (productData) {
            setProduct({
                name: name || '',
                category: category || '',
                price: price || '',
                description: description || '',
                url: imageURL || '',
                stock: stock || 0
            });
            setImagePreview(imageURL || '');
        }
    }, [productData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'File size must be less than 10MB' }));
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPG, PNG, GIF, WebP)' }));
                return;
            }

            // Clear any previous image errors
            if (errors.image) {
                setErrors(prev => ({ ...prev, image: '' }));
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            await uploadSingleImage(file);
        }
    };

    const uploadSingleImage = async (file) => {
        setIsUploading(true);

        try {
            // Convert file to base64
            const base64 = await convertToBase64(file);

            const response = await axios.post(
                `${getBaseUrl()}/uploadImage`,
                { image: base64 },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            if (response.data && response.data.url) {
                setNewImage(response.data.url);
                setImagePreview(response.data.url);
                showNotification('Image uploaded successfully!', 'success');
            } else if (response.data) {
                setNewImage(response.data);
                showNotification('Image uploaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setErrors(prev => ({
                ...prev,
                image: error.response?.data?.message || 'Failed to upload image. Please try again.'
            }));
            setImagePreview(product.url);
            showNotification('Failed to upload image. Please try again.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
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

    const handleStockUpdate = async (action) => {
        try {
            await updateStock({ id, quantity: stockQuantity, action }).unwrap();
            showNotification(`Stock ${action}d by ${stockQuantity}`, 'success');
            await refetch();
        } catch (error) {
            console.error('Failed to update stock:', error);
            showNotification('Failed to update stock', 'error');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!product.name.trim()) newErrors.name = 'Product name is required';
        if (!product.category) newErrors.category = 'Category is required';
        if (!product.price || product.price <= 0) newErrors.price = 'Valid price is required';
        if (!product.description.trim()) newErrors.description = 'Description is required';
        if (product.stock < 0) newErrors.stock = 'Stock cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (isUploading) {
            showNotification('Please wait for image upload to complete', 'error');
            return;
        }

        const updatedProduct = {
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            url: newImage || product.url,
            stock: product.stock,
            author: user?._id,
        };

        try {
            await updateProduct({ id: id, ...updatedProduct }).unwrap();
            showNotification('Product updated successfully!', 'success');
            await refetch();
            navigate("/dashboard/manage-products");
        } catch (error) {
            console.error('Failed to update product:', error);
            setErrors({ submit: error.data?.message || 'Failed to update product. Please try again.' });
        }
    };

    if (isProductLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                    <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading product</h3>
                    <p className="text-gray-600 mb-4">Could not fetch product details.</p>
                    <button
                        onClick={() => navigate('/dashboard/manage-products')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/dashboard/manage-products')}
                                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Products
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Update Product</h1>
                            <p className="mt-2 text-gray-600">Modify product details and manage inventory</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <PencilIcon className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Product Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
                            <p className="text-sm text-gray-600">Update basic product details</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <TagIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={product.category}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-3 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                                >
                                    {categories.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Price and Stock Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Price */}
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (USD) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={product.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className={`block w-full pl-10 pr-3 py-3 border ${errors.price ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                {/* Stock */}
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Quantity *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CubeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="stock"
                                            name="stock"
                                            value={product.stock}
                                            onChange={handleChange}
                                            min="0"
                                            className={`block w-full pl-10 pr-3 py-3 border ${errors.stock ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                                        />
                                    </div>
                                    {errors.stock && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                            {errors.stock}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={product.description}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-3 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none`}
                                    />
                                </div>
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stock Management */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Stock Management</h2>
                            <p className="text-sm text-gray-600">Quick stock adjustments</p>
                        </div>

                        <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white rounded-lg p-3 border">
                                            <CubeIcon className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Current Stock</p>
                                            <p className="text-2xl font-bold text-gray-900">{product.stock} units</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={stockQuantity}
                                            onChange={(e) => setStockQuantity(parseInt(e.target.value) || 1)}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleStockUpdate('decrease')}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <ArrowDownIcon className="h-4 w-4 mr-1" />
                                            Decrease
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStockUpdate('increase')}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <ArrowUpIcon className="h-4 w-4 mr-1" />
                                            Increase
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Product Image</h2>
                            <p className="text-sm text-gray-600">Update product image</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Current Image */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Current Image</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Current product"
                                                className="w-full h-48 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-48">
                                                <PhotoIcon className="h-12 w-12 text-gray-400" />
                                                <p className="ml-2 text-gray-500">No image available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload New Image */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Upload New Image</h4>
                                    <label
                                        htmlFor="image"
                                        className={`relative cursor-pointer bg-white rounded-lg border-2 border-dashed ${errors.image ? 'border-red-300' : 'border-gray-300'
                                            } p-6 hover:border-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''
                                            } block`}
                                    >
                                        <div className="text-center">
                                            {isUploading ? (
                                                <>
                                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-indigo-500 animate-pulse" />
                                                    <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-600">
                                                        Click to upload new image
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="sr-only"
                                        />
                                    </label>
                                    {errors.image && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                            {errors.image}
                                        </p>
                                    )}
                                    {newImage && (
                                        <p className="mt-2 text-sm text-green-600 flex items-center">
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            New image uploaded successfully
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {errors.submit && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700 flex items-center">
                                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/manage-products')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating || isUploading}
                                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {isUpdating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating Product...
                                    </>
                                ) : isUploading ? (
                                    <>
                                        <CloudArrowUpIcon className="h-4 w-4 mr-2 animate-pulse" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Update Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProduct;