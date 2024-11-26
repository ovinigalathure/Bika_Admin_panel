import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore"; 
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../../../firebase';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import './MenuTable.css';

const MenuTable = () => {
  const [menus, setMenus] = useState([]);
  const [menuTypes, setMenuTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMenuType, setNewMenuType] = useState({ type: '', image: null });
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [showMenuTypePopup, setShowMenuTypePopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();

  // Fetch menus and menu types from Firestore
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Menu"));
        const menuData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          imageUrl: doc.data().image,
          type: doc.data().menuType,
          name: doc.data().productName,
          price: doc.data().price,
          discount: doc.data().discount,
          customizeItems: doc.data().customizeItems || [],
        }));
        setMenus(menuData);
      } catch (error) {
        console.error("Error fetching menu items: ", error);
      }
    };

    const fetchMenuTypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menuTypes"));
        const typesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuTypes(typesData);
      } catch (error) {
        console.error("Error fetching menu types: ", error);
      }
    };

    fetchMenus();
    fetchMenuTypes();
  }, []);

  // Handle image upload for new menu type
  const addMenuType = async () => {
    try {
      if (newMenuType.image) {
        const imageRef = ref(storage, `menuTypeImages/${newMenuType.image.name}`);
        const uploadTask = uploadBytesResumable(imageRef, newMenuType.image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setImageUploadProgress(progress);
          },
          (error) => {
            console.error("Image upload error: ", error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, "menuTypes"), {
              type: newMenuType.type,
              imageUrl: downloadURL,
            });
            setNewMenuType({ type: '', image: null });
            setImageUploadProgress(0);
            setShowMenuTypePopup(false);
            setSuccessMessage('Menu Type added successfully!');
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 2000);
          }
        );
      }
    } catch (error) {
      console.error("Error adding menu type: ", error);
    }
  };

  // Handle delete for menu type
  const deleteMenuType = async (id, menuType) => {
    try {
      // Delete associated menu items
      const menuQuery = query(collection(db, "Menu"), where("menuType", "==", menuType));
      const menuSnapshot = await getDocs(menuQuery);
      const deleteMenuPromises = menuSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteMenuPromises);

      // Delete the menu type itself
      await deleteDoc(doc(db, "menuTypes", id));
      setMenuTypes(menuTypes.filter(menuType => menuType.id !== id));
      setMenus(menus.filter(menu => menu.type !== menuType));

      setSuccessMessage('Menu Type and associated menu items deleted successfully!');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error("Error deleting menu type and associated items: ", error);
    }
  };

  // Handle search filtering
  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle edit actions
  const handleEditClick = (menu) => {
    setEditingMenuId(menu.id);
    setEditFormData(menu);
  };

  const handleSaveClick = async (menuId) => {
    try {
      const menuDoc = doc(db, "Menu", menuId);
      await updateDoc(menuDoc, editFormData);
      setMenus(menus.map(menu => (menu.id === menuId ? editFormData : menu)));
      setEditingMenuId(null);
      setSuccessMessage('Menu Item updated successfully!');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error("Error updating menu item: ", error);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleCustomizeItemChange = (index, field, value) => {
    const updatedCustomizeItems = [...editFormData.customizeItems];
    updatedCustomizeItems[index][field] = value;
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      customizeItems: updatedCustomizeItems,
    }));
  };

  const handleDeleteClick = async (menuId) => {
    try {
      await deleteDoc(doc(db, "Menu", menuId));
      setMenus(menus.filter(menu => menu.id !== menuId));
      setSuccessMessage('Menu Item deleted successfully!');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error("Error deleting menu item: ", error);
    }
  };

  const handleCancelClick = () => {
    setEditingMenuId(null);
  };

  return (
    <div className="menu-table">
      <h2>Menu Types</h2>
      <button onClick={() => setShowMenuTypePopup(true)}>Add Menu Type</button>

      {showMenuTypePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Menu Type</h3>
            <input
              type="text"
              placeholder="Menu Type"
              value={newMenuType.type}
              onChange={(e) => setNewMenuType({ ...newMenuType, type: e.target.value })}
            />
            <input type="file" onChange={(e) => setNewMenuType({ ...newMenuType, image: e.target.files[0] })} />
            {imageUploadProgress > 0 && <p>Upload Progress: {imageUploadProgress}%</p>}

            <div className="popup-buttons">
              <button className="add-button" onClick={addMenuType}>Add</button>
              <button className="cancel-button" onClick={() => setShowMenuTypePopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</span>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Menu Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuTypes.length > 0 ? (
            menuTypes.map((menuType) => (
              <tr key={menuType.id}>
                <td><img src={menuType.imageUrl} alt={menuType.type} className="menu-image" /></td>
                <td>{menuType.type}</td>
                <td>
                  <button className="delete-button" onClick={() => deleteMenuType(menuType.id, menuType.type)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No menu types found</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Menu Items</h2>
      
      {/* Add Item Button */}
      <div className="menu-actions">
        <button onClick={() => navigate('/add')}>Add Menu Item</button>
      </div>

      <div className="menu-table__search">
        <input
          type="text"
          placeholder="Search the menu"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Menu Type</th>
            <th>Item Name</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Customize Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => (
              <tr key={menu.id}>
                <td><img src={menu.imageUrl} alt={menu.name} className="menu-image" /></td>
                <td>{editingMenuId === menu.id ? (
                    <input
                      type="text"
                      name="type"
                      value={editFormData.type}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    menu.type
                  )}
                </td>
                <td>{editingMenuId === menu.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    menu.name
                  )}
                </td>
                <td>{editingMenuId === menu.id ? (
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    menu.price
                  )}
                </td>
                <td>{editingMenuId === menu.id ? (
                    <input
                      type="number"
                      name="discount"
                      value={editFormData.discount}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    menu.discount
                  )}
                </td>
                <td>
                  {editingMenuId === menu.id ? (
                    editFormData.customizeItems.map((customize, index) => (
                      <div key={index}>
                        <input
                          type="text"
                          value={customize.item}
                          onChange={(e) =>
                            handleCustomizeItemChange(index, 'item', e.target.value)
                          }
                          placeholder="Customize Item"
                        />
                        <input
                          type="number"
                          value={customize.price}
                          onChange={(e) =>
                            handleCustomizeItemChange(index, 'price', e.target.value)
                          }
                          placeholder="Price"
                        />
                      </div>
                    ))
                  ) : (
                    menu.customizeItems.map((customize, index) => (
                      <div key={index}>{customize.item} - Rs.{customize.price}</div>
                    ))
                  )}
                </td>
                <td>
                  {editingMenuId === menu.id ? (
                    <>
                      <button onClick={() => handleSaveClick(menu.id)}>
                        <FontAwesomeIcon icon={faSave} /> Save
                      </button>
                      <button onClick={handleCancelClick}>
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(menu)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button onClick={() => handleDeleteClick(menu.id)}>
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No menu items found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MenuTable;
