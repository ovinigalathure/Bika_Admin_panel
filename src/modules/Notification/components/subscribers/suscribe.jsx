import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import Sidebar from "../../../Dashboard/components/sidebar/Sidebar";
import DashboardHeader from "../../../Dashboard/components/Header/Header";
import SubFilter from "./subFilter";
import emailjs from "emailjs-com"; // Import EmailJS
import "../main/NotificationFilters.css";

const Sub = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // Fetch subscribers from Firestore
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "subscribers"));
        const subscribersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email,
          subscribedAt: doc.data().subscribedAt?.toDate(),
        }));

        // Sort subscribers by subscribed date in descending order
        const sortedSubscribers = subscribersData.sort((a, b) => {
          return b.subscribedAt - a.subscribedAt;
        });

        setSubscribers(sortedSubscribers);
      } catch (error) {
        console.error("Error fetching subscribers: ", error);
      }
    };

    fetchSubscribers();
  }, []);

  // Handle individual email selection
  const handleEmailSelect = (email) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((e) => e !== email)
        : [...prevSelected, email]
    );
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedEmails(subscribers.map((subscriber) => subscriber.email));
    } else {
      setSelectedEmails([]);
    }
  };

  // Send emails to selected recipients
  const handleSendReply = async () => {
    if (selectedEmails.length > 0 && replyMessage) {
      try {
        const emailFailures = [];

        // Iterate over selected emails to send
        const emailPromises = selectedEmails.map(async (email) => {
          const templateParams = {
            to_email: email, // The selected recipient email
            custom_reply: replyMessage, // The message from the input field
          };

          try {
            await emailjs.send(
              "service_px7chl9", // Replace with your EmailJS service ID
              "template_so76x5e", // Replace with your EmailJS template ID
              templateParams,
              "pL-MCuxqlcLpzZcCi" // Replace with your EmailJS user ID
            );
            console.log("Email sent successfully to:", email);
          } catch (error) {
            console.error("Failed to send email to:", email, error);
            emailFailures.push({ email, error: error.message });
          }
        });

        // Wait for all email promises to complete
        await Promise.all(emailPromises);

        if (emailFailures.length > 0) {
          alert(
            `Some emails failed to send: ${emailFailures
              .map((e) => e.email)
              .join(", ")}`
          );
        } else {
          alert("Replies sent to all selected subscribers!");
        }

        // Reset state
        setSelectedEmails([]);
        setReplyMessage("");
        setIsModalOpen(false); // Close modal after sending
      } catch (error) {
        console.error("Error sending replies: ", error);
        alert("Failed to send replies.");
      }
    } else {
      alert("Please select at least one email and enter a reply message.");
    }
  };

  // Handle delete selected subscribers
  const handleDeleteSelected = async () => {
    if (selectedEmails.length > 0) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete the selected subscribers?"
      );
      if (!confirmDelete) return;

      try {
        const deletePromises = selectedEmails.map(async (email) => {
          const subscriberToDelete = subscribers.find(
            (subscriber) => subscriber.email === email
          );

          if (subscriberToDelete) {
            const docRef = doc(db, "subscribers", subscriberToDelete.id);
            await deleteDoc(docRef);
            console.log(`Deleted subscriber: ${email}`);
          }
        });

        // Wait for all delete promises to complete
        await Promise.all(deletePromises);

        // Update the subscribers list
        setSubscribers((prevSubscribers) =>
          prevSubscribers.filter(
            (subscriber) => !selectedEmails.includes(subscriber.email)
          )
        );

        // Clear selected emails
        setSelectedEmails([]);
        alert("Selected subscribers deleted successfully!");
      } catch (error) {
        console.error("Error deleting subscribers: ", error);
        alert("Failed to delete selected subscribers.");
      }
    } else {
      alert("Please select at least one subscriber to delete.");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main">
        <DashboardHeader title="Notification" />
        <SubFilter />

        <div className="subscriber-list">
          <div className="subscriber-header">
            <h2>Subscribers</h2>
            <button className="reply-button" onClick={() => setIsModalOpen(true)}>
              Reply
            </button>
            <button className="delete-button" onClick={handleDeleteSelected}>
              Delete
            </button>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />{" "}
              Select All
            </label>
          </div>
          <ul>
            {subscribers.length > 0 ? (
              subscribers.map((subscriber, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(subscriber.email)}
                      onChange={() => handleEmailSelect(subscriber.email)}
                    />
                    {subscriber.email} -{" "}
                    {subscriber.subscribedAt?.toLocaleString()}
                  </label>
                </li>
              ))
            ) : (
              <p>No subscribers found.</p>
            )}
          </ul>
        </div>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Reply to selected subscribers</h3>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Enter your reply message here"
                className="message-input"
              />
              <div className="modal-actions">
                <button className="send" onClick={handleSendReply}>
                  Send Reply
                </button>
                <button
                  className="cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sub;
