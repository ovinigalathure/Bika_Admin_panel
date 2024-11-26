import React, { useState } from 'react';
import emailjs from 'emailjs-com'; // Import EmailJS library
import './ReplyPopup.css'; // Add your CSS file for styling

const ReplyPopup = ({ contact, onClose }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message.');
      return;
    }
  
    const templateParams = {
      to_name: contact.name || 'Customer',
      to_email: contact.email || 'no-reply@example.com',
      user_question: contact.message || 'No question provided',
      admin_reply: replyMessage,
      from_name: 'BIKA Embilipitiya',
      from_email: 'bikaembilipitiya@gmail.com',
    };
  
    setIsSending(true);
    try {
      const response = await emailjs.send(
        'service_rb0hnfj',
        'template_0mnn4m3',
        templateParams,
        '4r2UZuDGP0lLf6zTS'
      );
  
      console.log('Email sent successfully:', response);
      alert(`Reply sent successfully to ${contact.name || 'the recipient'}`);
      setReplyMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error.status, error.text);
      alert(`Failed to send the reply. ${error.text}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="reply-popup-overlay">
      <div className="reply-popup">
        <h2>Reply to {contact.name}</h2>
        <p><strong>Email:</strong> {contact.email}</p>
        <p><strong>Subject:</strong> {contact.subject}</p>
        <p><strong>Question:</strong> {contact.message}</p> {/* Display the original message */}
        <textarea
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Enter your reply message here..."
          rows="6"
        />
        <div className="reply-popup-buttons">
          <button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send'}
          </button>
          <button onClick={onClose} disabled={isSending}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyPopup;
