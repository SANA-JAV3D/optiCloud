import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFetchProductByIdQuery, useUpdateProductMutation, useUpdateStockMutation } from '../../../../redux/features/products/productsApi';
import { useSelector } from 'react-redux';
import TextInput from '../addProduct/TextInput';
import SelectInput from '../addProduct/SelectInput';
import UploadImage from '../addProduct/UploadImage';

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
    const { user } = useSelector((state) => state.auth)
    const [product, setProduct] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        url: '',
        stock: 0
    })

    const { data: productData, isLoading: isProductLoading, error: fetchError, refetch } = useFetchProductByIdQuery(id);

    const [newImage, setNewImage] = useState(null)

    const { name, category, description, url: imageURL, price, stock } = productData?.product || {};

    const [updateProduct, { isLoading: isUpdating, error: updateError }] = useUpdateProductMutation();
    const [updateStock] = useUpdateStockMutation();

    useEffect(() => {
        if (productData) {
            setProduct({
                name: name || '',
                category: category || '',
                price: price || '',
                description: description || '',
                image: imageURL || '',
                stock: stock || 0
            })
        }
    }, [productData])


    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });
    };

    const handleImageChange = (image) => {
        setNewImage(image);
    }

    const handleStockUpdate = async (action, quantity = 1) => {
        try {
            await updateStock({ id, quantity, action }).unwrap();
            alert(`Stock ${action}d successfully`);
            await refetch();
        } catch (error) {
            console.error('Failed to update stock:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure a valid URL is present
        const imageUrl = newImage || product.image;
        if (!imageUrl) {
            alert("Image URL is required.");
            return;
        }
        const updatedProduct = {
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            url: newImage || product.image,
            stock: product.stock,
            author: user?._id,
        };
        try {
            await updateProduct({ id: id, ...updatedProduct }).unwrap();
            alert('Product updated successfully');
            await refetch();
            navigate("/dashboard/manage-products")
        } catch (error) {
            console.error('Failed to update product:', error);
        }

    }

    if (isProductLoading) return <div>Loading....</div>
    if (fetchError) return <div>Error fetching product!...</div>
    return (
        <div className='container mx-auto mt-8'>
            <h2 className='text-2xl font-bold mb-6'>Update Product </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
                <TextInput
                    label="Product Name"
                    name="name"
                    placeholder="Ex: Diamond Earrings"
                    value={product.name}
                    onChange={handleChange}
                />
                <SelectInput
                    label="Category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    options={categories}
                />
                <TextInput
                    label="Price"
                    name="price"
                    type="number"
                    placeholder="50"
                    value={product.price}
                    onChange={handleChange}
                />

                <UploadImage
                    name="image"
                    id="image"
                    value={newImage || product.image}
                    placeholder='Image'
                    setImage={handleImageChange}
                />
                <TextInput
                    label="Stock Quantity"
                    name="stock"
                    type="number"
                    placeholder="0"
                    value={product.stock}
                    onChange={handleChange}
                />
                <div className="flex gap-4 items-center">
                    <button
                        type="button"
                        onClick={() => handleStockUpdate('decrease')}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Decrease Stock (-1)
                    </button>
                    <span className="font-medium">Current Stock: {product.stock}</span>
                    <button
                        type="button"
                        onClick={() => handleStockUpdate('increase')}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Increase Stock (+1)
                    </button>
                </div>
                <div>
                    <label htmlFor="description" className='block text-sm font-medium text-gray-700'>Description</label>
                    <textarea name="description" id="description"
                        className='add-product-InputCSS'
                        value={product.description}
                        placeholder='Write a product description'
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div>
                    <button type='submit'
                        className='add-product-btn'

                    >{isUpdating ? 'Updating...' : 'Update Product'}</button>
                </div>

            </form>
        </div>
    )
}

export default UpdateProduct