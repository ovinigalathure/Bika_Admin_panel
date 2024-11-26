import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import './StaffTable.css';

const StaffTable = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    section: 'delivery',
    dob: '',
    address: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const db = getFirestore();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffCollection = collection(db, 'staff');
        const staffSnapshot = await getDocs(staffCollection);
        const staffList = staffSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStaff(staffList);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaff();
  }, [db]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors({ ...errors, [name]: '' }); // Clear errors for the field
  };

  const handleAddMember = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      section: 'delivery',
      dob: '',
      address: '',
      phone: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters.';
    }
    if (!formData.email || !gmailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid @gmail.com email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required.';
    }
    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters.';
    }
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const staffData = { ...formData, password: hashedPassword };

      const staffCollection = collection(db, 'staff');
      await addDoc(staffCollection, staffData);

      setStaff((prevStaff) => [...prevStaff, { ...staffData, id: new Date().getTime().toString() }]);
      handleCloseModal();
    } catch (error) {
      console.error('Error adding staff member:', error);
    }
  };

  return (
    <div className="staff-table-container">
      <Button onClick={handleAddMember} variant="primary" className="add-member-button">
        Add Member
      </Button>

      <Table striped bordered hover className="staff-table mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Section</th>
            <th>Date of Birth</th>
            <th>Address</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.section}</td>
              <td>{member.dob}</td>
              <td>{member.address}</td>
              <td>{member.phone}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Member Modal */}
      <Modal show={showModal} onHide={handleCloseModal} className="modelAdd" centered>
        <Modal.Header className="modal-header-custom">
          <Modal.Title>Add New Member</Modal.Title>
          <Button variant="link" className="close-icon-button" onClick={handleCloseModal}>
            <i className="bi bi-x-lg"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName" className="modal-form-group">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formEmail" className="modal-form-group mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPassword" className="modal-form-group mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formSection" className="modal-form-group mt-3">
              <Form.Label>Section</Form.Label>
              <Form.Control
                as="select"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
              >
                <option value="delivery">Delivery</option>
                <option value="kitchen">Kitchen</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formDOB" className="modal-form-group mt-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                isInvalid={!!errors.dob}
              />
              <Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formAddress" className="modal-form-group mt-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                isInvalid={!!errors.address}
              />
              <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPhone" className="modal-form-group mt-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit" className="modal-submit-button mt-3">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StaffTable;
