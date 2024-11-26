import React from "react";
import "./OrderDetailsModal.css";

const OrderDetailsModal = ({ order, userDetails, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Details</h2>
        <button className="close-button" onClick={onClose}>
          ✖
        </button>

        {/* User Information Section */}
        <div className="modal-section">
          <h3>User Information</h3>
          <p>
            <strong>Name:</strong> {userDetails?.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {userDetails?.email || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {userDetails?.phone || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {order?.address || "N/A"}
          </p>
        </div>

        {/* Order Information Section */}
        <div className="modal-section">
          <h3>Order Information</h3>
          <p>
            <strong>Order ID:</strong> {order?.id || "N/A"}
          </p>
          <p>
            <strong>Delivery Option:</strong> {order?.deliveryOption || "N/A"}
          </p>
          <p>
            <strong>Total Price:</strong> Rs.{" "}
            {order?.totalPrice
              ? parseFloat(order.totalPrice).toFixed(2)
              : "N/A"}
          </p>
        </div>

        {/* Items Section */}
        <div className="modal-section">
          <h3>Items</h3>
          {order?.items?.map((item, index) => (
            <div key={index} className="order-item">
              <p>
                <strong>Product:</strong> {item.productName || "N/A"}
              </p>
              <p>
                <strong>Base Price:</strong> Rs.{" "}
                {item.price
                  ? parseFloat(item.price).toFixed(2)
                  : "N/A"}
              </p>
              <p>
                <strong>Quantity:</strong> {item.quantity || 0}
              </p>
              <p>
                <strong>Total:</strong> Rs.{" "}
                {(
                  (parseFloat(item.price || 0) *
                    (1 - (item.discount || 0) / 100) +
                    (item.customizeDetails || []).reduce(
                      (acc, custom) =>
                        acc +
                        parseFloat(custom.price || 0) *
                          parseFloat(custom.quantity || 0),
                      0
                    )) *
                  parseFloat(item.quantity || 0)
                ).toFixed(2)}
              </p>

              {/* Customization Details */}
              {item.customizeDetails && item.customizeDetails.length > 0 && (
                <div className="customization-section">
                  <h4>Customizations:</h4>
                  <ul>
                    {item.customizeDetails.map((custom, customIndex) => (
                      <li key={customIndex}>
                        {custom.item || "N/A"} (x
                        {custom.quantity || 0}) - Rs.{" "}
                        {(
                          parseFloat(custom.price || 0) *
                          parseFloat(custom.quantity || 0)
                        ).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
