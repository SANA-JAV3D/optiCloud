// import React, { useState, useEffect } from 'react'
// import { useFetchProductByIdQuery } from '../../../../redux/features/products/productsApi';
// import {
//     XMarkIcon,
//     ShoppingBagIcon,
//     CubeIcon,
//     CurrencyDollarIcon,
//     TagIcon,
//     DocumentTextIcon,
//     PhotoIcon,
//     ExclamationTriangleIcon,
//     CheckCircleIcon,
//     ClockIcon
// } from '@heroicons/react/24/outline';

// const ProductDetailsModal = ({ products, isOpen, onClose }) => {
//     const [selectedProductIndex, setSelectedProductIndex] = useState(0);

//     const getCurrentProduct = () => {
//         if (!products || products.length === 0) return null;
//         return products[selectedProductIndex];
//     };

//     // Use Redux hook to fetch current product details
//     const currentProduct = getCurrentProduct();
//     // const {
//     //     data: productData,
//     //     isLoading,
//     //     error
//     // } = useFetchProductByIdQuery(currentProduct?._id, {
//     //     skip: !isOpen || !currentProduct?._id
//     // });

//     const currentProductDetails = productData?.product || [];

//     const formatPrice = (price) => {
//         return new Intl.NumberFormat('en-IN', {
//             style: 'currency',
//             currency: 'INR',
//             minimumFractionDigits: 2
//         }).format(price);
//     };

//     const getImageSrc = (product) => {
//         if (!product?.url) return '/placeholder-image.jpg';

//         // Check if it's a Cloudinary URL or external URL
//         if (product.url.startsWith('http')) {
//             return product.url;
//         }

//         // Check if it's a local asset
//         if (product.url.split('/').length <= 1) {
//             return `/assets/${product.url}`;
//         }

//         return product.url;
//     };

//     const getStockStatus = (stock) => {
//         if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50', icon: XCircleIcon };
//         if (stock <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50', icon: ExclamationTriangleIcon };
//         return { text: 'In Stock', color: 'text-green-600 bg-green-50', icon: CheckCircleIcon };
//     };

//     const calculateSubtotal = (price, quantity) => {
//         return (price * quantity).toFixed(2);
//     };

//     // Close modal on backdrop click
//     const handleBackdropClick = (e) => {
//         if (e.target === e.currentTarget) {
//             onClose();
//         }
//     };

//     // Close modal on escape key
//     useEffect(() => {
//         const handleEscape = (e) => {
//             if (e.key === 'Escape') {
//                 onClose();
//             }
//         };

//         document.addEventListener('keydown', handleEscape);
//         return () => document.removeEventListener('keydown', handleEscape);
//     }, [onClose]);

//     if (!isOpen || !products || products.length === 0) return null;

//     return (
//         <div
//             className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
//             onClick={handleBackdropClick}
//         >
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto">
//                 {/* Header */}
//                 <div className="px-6 py-4 border-b border-gray-200">
//                     <div className="flex items-center justify-between">
//                         <h2 className="text-xl font-semibold text-gray-900">Order Products Details</h2>
//                         <button
//                             onClick={onClose}
//                             className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//                         >
//                             <XMarkIcon className="h-5 w-5" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Product Navigation */}
//                 {products.length > 1 && (
//                     <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//                         <div className="flex items-center space-x-2 overflow-x-auto">
//                             {products.map((product, index) => (
//                                 <button
//                                     key={product._id}
//                                     onClick={() => setSelectedProductIndex(index)}
//                                     className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${selectedProductIndex === index
//                                         ? 'bg-indigo-600 text-white border-indigo-600'
//                                         : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                                         }`}
//                                 >
//                                     <ShoppingBagIcon className="h-4 w-4 mr-2" />
//                                     Product {index + 1} (Qty: {product.quantity})
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 {/* Content */}
//                 <div className="p-6">
//                     {isLoading ? (
//                         <div className="flex items-center justify-center py-12">
//                             <div className="text-center">
//                                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//                                 <p className="mt-4 text-gray-600">Loading product details...</p>
//                             </div>
//                         </div>
//                     ) : error ? (
//                         <div className="flex items-center justify-center py-12">
//                             <div className="text-center">
//                                 <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
//                                 <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Product</h3>
//                                 {/* <p className="text-gray-600 mb-4">{error}</p> */}
//                                 <button
//                                     onClick={() => window.location.reload()}
//                                     className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
//                                 >
//                                     Try Again
//                                 </button>
//                             </div>
//                         </div>
//                     ) : currentProductDetails ? (
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                             {/* Product Image */}
//                             <div className="space-y-4">
//                                 <div className="bg-gray-50 rounded-lg p-4 border">
//                                     <img
//                                         src={getImageSrc(currentProductDetails)}
//                                         alt={currentProductDetails.name}
//                                         className="w-full h-64 object-cover rounded-lg"
//                                         onError={(e) => {
//                                             e.target.src = '/placeholder-image.jpg';
//                                         }}
//                                     />
//                                 </div>

//                                 {/* Order Quantity Info */}
//                                 <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
//                                     <h4 className="text-sm font-medium text-indigo-900 mb-2">Order Information</h4>
//                                     <div className="grid grid-cols-2 gap-4 text-sm">
//                                         <div>
//                                             <span className="text-indigo-700">Quantity Ordered:</span>
//                                             <p className="font-semibold text-indigo-900">{currentProduct.quantity}</p>
//                                         </div>
//                                         <div>
//                                             <span className="text-indigo-700">Subtotal:</span>
//                                             <p className="font-semibold text-indigo-900">
//                                                 {formatPrice(calculateSubtotal(currentProductDetails.price, currentProduct.quantity))}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Product Details */}
//                             <div className="space-y-6">
//                                 {/* Basic Info */}
//                                 <div>
//                                     <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentProductDetails.name}</h3>
//                                     <div className="flex items-center space-x-4 mb-4">
//                                         <div className="flex items-center text-lg font-semibold text-gray-900">
//                                             <CurrencyDollarIcon className="h-5 w-5 mr-1 text-gray-400" />
//                                             {formatPrice(currentProductDetails.price)}
//                                         </div>
//                                         <span className="text-sm text-gray-500">per unit</span>
//                                     </div>
//                                 </div>

//                                 {/* Category */}
//                                 <div className="flex items-center space-x-2">
//                                     <TagIcon className="h-5 w-5 text-gray-400" />
//                                     <span className="text-sm font-medium text-gray-700">Category:</span>
//                                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
//                                         {currentProductDetails.category}
//                                     </span>
//                                 </div>

//                                 {/* Stock Status */}
//                                 <div className="flex items-center space-x-2">
//                                     <CubeIcon className="h-5 w-5 text-gray-400" />
//                                     <span className="text-sm font-medium text-gray-700">Stock:</span>
//                                     <div className="flex items-center">
//                                         {(() => {
//                                             const statusInfo = getStockStatus(currentProductDetails.stock);
//                                             const IconComponent = statusInfo.icon;
//                                             return (
//                                                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
//                                                     <IconComponent className="h-3 w-3 mr-1" />
//                                                     {statusInfo.text}
//                                                 </span>
//                                             );
//                                         })()}
//                                         <span className="ml-2 text-sm text-gray-600">
//                                             ({currentProductDetails.stock} available)
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {/* Product ID */}
//                                 <div className="flex items-center space-x-2">
//                                     <DocumentTextIcon className="h-5 w-5 text-gray-400" />
//                                     <span className="text-sm font-medium text-gray-700">Product ID:</span>
//                                     <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
//                                         {currentProduct._id}
//                                     </span>
//                                 </div>

//                                 {/* Description */}
//                                 <div>
//                                     <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
//                                         <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
//                                         Description
//                                     </h4>
//                                     <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
//                                         {currentProductDetails.description || 'No description available.'}
//                                     </p>
//                                 </div>

//                                 {/* Additional Info */}
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <h5 className="text-sm font-medium text-gray-700 mb-2">Unit Price</h5>
//                                         <p className="text-xl font-bold text-gray-900">
//                                             {formatPrice(currentProductDetails.price)}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <h5 className="text-sm font-medium text-gray-700 mb-2">Total for {currentProduct.quantity} item(s)</h5>
//                                         <p className="text-xl font-bold text-indigo-600">
//                                             {formatPrice(calculateSubtotal(currentProductDetails.price, currentProduct.quantity))}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="flex items-center justify-center py-12">
//                             <div className="text-center">
//                                 <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                                 <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
//                                 <p className="text-gray-600">This product may have been removed or is no longer available.</p>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
//                     <div className="flex items-center justify-between">
//                         <div className="text-sm text-gray-600">
//                             {products.length > 1 && (
//                                 <>Showing product {selectedProductIndex + 1} of {products.length}</>
//                             )}
//                         </div>
//                         <button
//                             onClick={onClose}
//                             className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
//                         >
//                             Close
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProductDetailsModal;