/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ListComponent from '../common/ListComponent';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ItemForm from './ItemForm';
import { Trash2 } from 'lucide-react';

const ItemModal = ({ isOpen, onClose, title, children }) => {
    const { isDarkMode } = useTheme();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className={`rounded-lg shadow-xl w-11/12 max-w-4xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <div className="border-b px-4 py-2 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ItemMasterComponent = () => {
    const [items, setItems] = useState([]);
    const { isDarkMode } = useTheme();
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 15
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            console.log("token",storedToken);
        }
    }, []);

    const fetchItems = async (page = 1) => {
        if (!token) {
            console.error('No token available');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/items?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchItems();
        }
    }, [token]);

    const handleCreateNew = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        try {
            console.log("formData",formData);
            const response = await axios.post('http://localhost:5000/api/items', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('New Item:', response.data);
            setIsModalOpen(false);
            fetchItems(); // Refresh the list
        } catch (error) {
            console.error('Error creating item:', error);
            // TODO: Handle error (e.g., show error message to user)
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            console.log("itemId",itemId);
            try {
                // setIsLoading(true);
                await axios.delete(`http://localhost:5000/api/items/${itemId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // Refresh the item list after successful deletion
                fetchItems();
            } catch (err) {
                console.error('Error deleting item:', err);
                setError('Failed to delete item. Please try again.');
            } finally {
                // setIsLoading(false);
            }
        }
    };

    const columns = [
        { header: 'Code', key: 'ItemCode' },
        { header: 'Name', key: 'ItemName' },
        { header: 'Type', key: 'type' },
        { header: 'SAC/HSN Code', key: 'SAC_HSN_Code' },
        { header: 'Category', key: 'ItemCategory' },
        { header: 'IGST', key: 'IGST_Rate', render: (item) => item.IGST_Rate ? `${item.IGST_Rate}%` : '-' },
        { header: 'CGST', key: 'CGST_Rate', render: (item) => item.CGST_Rate ? `${item.CGST_Rate}%` : '-' },
        { header: 'SGST', key: 'SGST_Rate', render: (item) => item.SGST_Rate ? `${item.SGST_Rate}%` : '-' },
        { header: 'UTGST', key: 'UTGST_Rate', render: (item) => item.UTGST_Rate ? `${item.UTGST_Rate}%` : '-' },
        {
            header: 'Actions',
            key: 'actions',
            render: (item) => (
                <button
                    onClick={() => handleDeleteItem(item._id)}
                    className={`p-1 rounded ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                    title="Delete Item"
                >
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    return (
        <>
            <ListComponent
                title="Item Master"
                data={items}
                columns={columns}
                onFetch={fetchItems}
                pagination={pagination}
                onCreateNew={handleCreateNew}
            />
            <ItemModal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Item">
                <ItemForm onSubmit={handleSubmit} onCancel={handleCloseModal} />
            </ItemModal>
        </>
    );
};

export { ItemMasterComponent };
