import React, { useState, useEffect } from 'react';
import { saveForm, deleteForm, updateForm } from '../../service/FormService';
import { Link } from 'react-router-dom';

const FormManagement = () => {
    const [formData, setFormData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formName, setFormName] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formId, setFormId] = useState('');

    const fetchTypeOfForm = async () => {
        try {
            // const response = await fetch('http://nckh.local/api/forms');
            const response = await fetch('http://nckh.local/api/get');
            const data = await response.json();
            setFormData(data);
        } catch (error) {
            console.error('Error fetching type of form:', error);
        }
    };
    useEffect(() => {

        fetchTypeOfForm();
    }, []);
    const handleSaveForm = async () => {
        saveForm(formName)
        .then(() => {
            // TODO: fetch form data again
            setRefresh(!refresh);
            setFormName('');
        })
        .catch((error) => {
            console.error('Error saving form:', error);
        });
    }

    const handleDeleteForm = async (formId) => {
        deleteForm(formId)
        .then(() => {
            setRefresh(!refresh);
        })
        .catch((error) => {
            console.error('Error deleting form:', error);
        });
    }   

    const handleEditForm = async (formId) => {
        setIsEdit(true);
        setIsModalOpen(true);
        setFormId(formId);
        setFormName(formData.find(item => item.id === formId).name);
    }   

    const handleUpdateForm = async (formId) => {
        setIsModalOpen(false);
        updateForm(formId, formName)
        .then(() => {
            setRefresh(!refresh);
        })
        .catch((error) => {
            console.error('Error deleting form:', error);
        });
    }

    useEffect(() => {
        fetchTypeOfForm();
    }, [refresh]);


    return (
        <>
            <div className="p-6 bg-white rounded-xl shadow-md">
                <Link 
                to="/gui"
                className="bg-blue-500 text-white px-4 py-2 ml-auto w-fit block rounded-md" 
                //  onClick={() => setIsModalOpen(true)} 
                  >New</Link>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {formData.length > 0 ? (
                            formData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-800">{item.id}</td>
                                    <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-800">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEditForm(item.id)}
                                                className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteForm(item.id)}
                                                className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                            {/* <Link
                                                // to={`/admin/create-layout/${item.id}`}
                                                to={`/gui`}
                                                onClick={() => console.log('Create Layout', item.id)}
                                                className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                                            >
                                                Custom Layout
                                            </Link> */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center px-6 py-4 text-sm text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                            <h2 className="text-lg font-semibold mb-4">Create New Form</h2>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setIsModalOpen(false);
                                }}
                            >
                                <div className="mb-4">
                                    <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Form Name
                                    </label>
                                    <input
                                        type="text"
                                        id="formName"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Enter form name"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => isEdit ? handleUpdateForm(formId) : handleSaveForm()}
                                        type="submit"
                                        className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
};

export default FormManagement;