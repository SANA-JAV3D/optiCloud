import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAddProductMutation } from '../../../../redux/features/products/productsApi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getBaseUrl } from '../../../../utils/baseURL';
import {
    PhotoIcon,
    CurrencyDollarIcon,
    TagIcon,
    DocumentTextIcon,
    CubeIcon,
    PlusIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    CloudArrowUpIcon
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

const AddProduct = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        stock: 0
    });
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    const [AddProduct, { isLoading }] = useAddProductMutation();

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
                setImage(response.data.url);
                showNotification('Image uploaded successfully!', 'success');
            } else if (response.data) {
                // Handle case where response.data is the URL directly
                setImage(response.data);
                showNotification('Image uploaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setErrors(prev => ({
                ...prev,
                image: error.response?.data?.message || 'Failed to upload image. Please try again.'
            }));
            setImagePreview('');
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

    const validateForm = () => {
        const newErrors = {};

        if (!product.name.trim()) newErrors.name = 'Product name is required';
        if (!product.category) newErrors.category = 'Category is required';
        if (!product.price || product.price <= 0) newErrors.price = 'Valid price is required';
        if (!product.description.trim()) newErrors.description = 'Description is required';
        if (product.stock < 0) newErrors.stock = 'Stock cannot be negative';
        if (!image) newErrors.image = 'Product image is required';

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

        try {
            await AddProduct({
                ...product,
                url: image,
                author: user?._id
            }).unwrap();

            showNotification('Product added successfully!', 'success');

            // Reset form
            setProduct({
                name: '',
                category: '',
                price: '',
                description: '',
                stock: 0
            });
            setImage('');
            setImagePreview('');
            setErrors({});

            navigate("/dashboard/manage-products");
        } catch (error) {
            console.error("Failed to submit product", error);
            setErrors({ submit: error.data?.message || 'Failed to add product. Please try again.' });
        }
    };

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
                            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                            <p className="mt-2 text-gray-600">Create a new product for your optical components store</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <PlusIcon className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
                            <p className="text-sm text-gray-600">Basic details about your product</p>
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
                                        placeholder="Ex: Plano Concave Lens"
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
                                            placeholder="0.00"
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
                                            placeholder="0"
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
                                        placeholder="Describe your product features, specifications, and benefits..."
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

                    {/* Image Upload Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Product Image</h2>
                            <p className="text-sm text-gray-600">Upload a high-quality image of your product</p>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Upload Area */}
                                <div className="flex-1">
                                    <label
                                        htmlFor="image"
                                        className={`relative cursor-pointer bg-white rounded-lg ${errors.image ? 'border-red-300' : 'border-gray-300'
                                            } p-6 hover:border-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''
                                            }`}
                                    >
                                        <div className="text-center">
                                            {isUploading ? (
                                                <>
                                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-indigo-500 animate-pulse" />
                                                    <div className="mt-4">
                                                        <p className="text-base font-medium text-gray-900">
                                                            Uploading image...
                                                        </p>
                                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-indigo-600 h-2 rounded-full animate-pulse"></div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="mt-4">
                                                        <p className="text-base font-medium text-gray-900">
                                                            Click to upload product image
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            PNG, JPG, GIF, WebP up to 10MB
                                                        </p>
                                                    </div>
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
                                </div>

                                {/* Preview */}
                                {imagePreview && (
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                            />
                                            {image && (
                                                <p className="mt-2 text-xs text-green-600 flex items-center">
                                                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Uploaded successfully
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                disabled={isLoading || isUploading}
                                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding Product...
                                    </>
                                ) : isUploading ? (
                                    <>
                                        <CloudArrowUpIcon className="h-4 w-4 mr-2 animate-pulse" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add Product
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

export default AddProduct;