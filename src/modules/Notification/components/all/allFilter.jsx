import React, { useEffect, useState } from 'react';
import { db } from '../../../../firebase'; // Ensure you import your Firestore instance
import { collection, getDocs } from 'firebase/firestore';
import './allFilter.css';

const AllFilter = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch comments from Firestore on component mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsRef = collection(db, 'Comments'); // Reference to Comments collection
        const querySnapshot = await getDocs(commentsRef);
        let commentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort comments by createdAt in descending order (most recent first)
        commentsData = commentsData.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0; // Default to 0 if no timestamp
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; // Sort descending
        });

        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments: ', error);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []); // Ensure dependency array is valid

  return (
    <div className="notification-filters">
      <h2>Comments</h2>
      {loading && <p>Loading comments...</p>} {/* Loading indicator */}
      {error && <p className="error-message">{error}</p>} {/* Display error message */}
      
      {/* Display the comments */}
      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <p><strong>Name:</strong> {comment.name || 'No name provided'}</p> {/* Display Name */}
              <p><strong>City:</strong> {comment.city || 'No city provided'}</p> {/* Display City */}
              <p><strong>Comment:</strong> {comment.comment || 'No comment provided'}</p> {/* Display Comment */}
              <p><strong>Date:</strong> {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : 'No timestamp available'}</p> {/* Format and Display Date */}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No comments found.</p> // Show if no comments and not loading
      )}
    </div>
  );
};

export default AllFilter;
