import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
import emailjs from "emailjs-com";
import "./ProductForm.css";

const ProductForm = () => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");  // Added state for image preview
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageUpload = async (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);

    // If you want to display the image preview immediately after selection, you can create a local URL for it.
    if (selectedImage) {
      const localImageUrl = URL.createObjectURL(selectedImage);
      setImageUrl(localImageUrl); // Set the preview image URL
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Upload image to Firebase Storage
      let uploadedImageUrl = "";
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        uploadedImageUrl = await getDownloadURL(snapshot.ref);
        setImageUrl(uploadedImageUrl);  // Set the uploaded image URL
      }

      // Prepare product data
      const productData = {
        productName,
        price,
        discount,
        image: uploadedImageUrl,  // Image URL saved to Firestore
        description,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: "customer-promotion",
        sentAt: new Date().toISOString(),
      };

      // Save product data to Firestore
      await addDoc(collection(db, "products"), productData);

      // Fetch subscriber emails from the 'subscribers' collection
      const subscribersSnapshot = await getDocs(collection(db, "subscribers"));
      const subscriberEmails = subscribersSnapshot.docs.map((doc) => doc.data().email);

      // Send emails to all subscribers using EmailJS
      if (subscriberEmails.length > 0) {
        await sendPromotionEmails(subscriberEmails, productData);
      } else {
        alert("No subscribers found to send the promotion email.");
      }

      // Reset the form
      setProductName("");
      setPrice("");
      setDiscount("");
      setImage(null);
      setImageUrl(""); // Clear the preview image
      setDescription("");

      alert("Product added successfully and emails sent!");

      // Navigate to the "/promo" route
      navigate("/promo");

    } catch (error) {
      console.error("Error adding product or sending emails: ", error);
      alert(`Error: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const sendPromotionEmails = async (subscriberEmails, productData) => {
    // Initialize an array to store errors
    const emailFailures = [];

    const emailPromises = subscriberEmails.map(async (email) => {
      const templateParams = {
        to_email: email,
        product_name: productData.productName,
        price: productData.price,
        discount: productData.discount,
        description: productData.description,
        image_url: productData.image,
        date: productData.date,
        time: productData.time,
      };

      try {
        const response = await emailjs.send(
          "service_px7chl9", // Replace with your EmailJS service ID
          "template_rafkv72", // Replace with your EmailJS template ID
          templateParams,
          "pL-MCuxqlcLpzZcCi" // Replace with your EmailJS user ID
        );
        console.log("Email sent successfully to:", email, response.status);
      } catch (error) {
        console.error("Failed to send email to:", email, error);
        emailFailures.push({ email, error: error.message });
      }
    });

    await Promise.all(emailPromises);

    // Check if any emails failed
    if (emailFailures.length > 0) {
      console.error("The following emails failed to send:", emailFailures);
      throw new Error(`Failed to send emails to some subscribers: ${emailFailures.map(e => e.email).join(", ")}`);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="productName">Product Name</label>
        <input
          type="text"
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price</label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="discount">Discount (%)</label>
        <input
          type="number"
          id="discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Add Image</label>
        <input
          type="file"
          id="image"
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>

      {imageUrl && (
        <div className="form-group">
          <label>Image Preview:</label>
          <img src={imageUrl} alt="Selected Product" style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          required
        ></textarea>
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default ProductForm;
