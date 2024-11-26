import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from '../../../../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs, addDoc } from "firebase/firestore";
import './add.css';

const AddProduct = () => {
  const [menuType, setMenuType] = useState("");
  const [menuTypes, setMenuTypes] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [customizeItems, setCustomizeItems] = useState([]); // Array of objects with item and price
  const [customizeInput, setCustomizeInput] = useState("");
  const [customizePriceInput, setCustomizePriceInput] = useState("");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch menu types from Firestore
  useEffect(() => {
    const fetchMenuTypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menuTypes"));
        const typesData = querySnapshot.docs.map(doc => doc.data().type);
        setMenuTypes(typesData);
      } catch (error) {
        console.error("Error fetching menu types: ", error);
      }
    };

    fetchMenuTypes();
  }, []);

  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const handleAddCustomizeItem = () => {
    if (customizeInput.trim() && customizePriceInput.trim()) {
      setCustomizeItems(prevItems => [
        ...prevItems, 
        { item: customizeInput.trim(), price: customizePriceInput.trim() }
      ]);
      setCustomizeInput(""); // Clear item input
      setCustomizePriceInput(""); // Clear price input
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "Menu"), {
        menuType,
        productName,
        price,
        discount,
        customizeItems, // Array of objects with item and price
        image: imageUrl,
        description,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });

      // Clear the form
      setMenuType("");
      setProductName("");
      setPrice("");
      setDiscount("");
      setCustomizeItems([]);
      setImage(null);
      setDescription("");
      setCustomizeInput("");
      setCustomizePriceInput("");

      alert("Product added successfully!");
      navigate("/menu");

    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Error adding product. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className="add-product-form" onSubmit={handleSubmit}>
      <div className="add-form-group">
        <label htmlFor="menuType">Menu Type</label>
        <select
          id="menuType"
          value={menuType}
          onChange={(e) => setMenuType(e.target.value)}
          required
        >
          <option value="">Select Menu Type</option>
          {menuTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="add-form-group">
        <label htmlFor="addProductName">Item Name</label>
        <input
          type="text"
          id="addProductName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>

      <div className="add-form-group">
        <label htmlFor="addPrice">Price</label>
        <input
          type="number"
          id="addPrice"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="add-form-group">
        <label htmlFor="addDiscount">Discount (%)</label>
        <input
          type="number"
          id="addDiscount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          required
        />
      </div>

      <div className="add-form-group">
        <label htmlFor="customizeItem">Customize Item and Price</label>

        <div className="customize-input-group">
          <input
            type="text"
            value={customizeInput}
            onChange={(e) => setCustomizeInput(e.target.value)}
            placeholder="Customize Item"
          />
          <input
            type="number"
            value={customizePriceInput}
            onChange={(e) => setCustomizePriceInput(e.target.value)}
            placeholder="Price"
          />
          <button type="button" onClick={handleAddCustomizeItem}>Add</button>
        </div>

        <div>
          <h4>Selected Customizations:</h4>
          <ul>
            {customizeItems.map((customize, index) => (
              <li key={index}>{customize.item} - Rs.{customize.price}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="add-form-group">
        <label htmlFor="addImage">Add Image</label>
        <input
          type="file"
          id="addImage"
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>

      <button type="submit" className="add-submit-button" disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default AddProduct;
