import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

const ProfileScreen = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const { data } = await axios.put(
        '/api/users/profile',
        { name, email, password },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'UPDATE_SUCCESS' });

      ctxDispatch({ type: 'USER_SIGNIN', payload: data });

      localStorage.setItem('userInfo', JSON.stringify(data));

      toast.success('User updated successfully');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' });

      toast.error(getError(err));
    }
  };

  return (
    <div style={containerStyle} className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <div style={boxContainerStyle}>
        <h1 style={headingStyle} className="my-3">
          User Profile
        </h1>
        <form onSubmit={submitHandler} style={formStyle}>
          <Form.Group controlId="name" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group controlId="email" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group controlId="password" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group controlId="confirmPassword" style={formGroupStyle}>
            <Form.Label style={labelStyle}>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </Form.Group>
          <div style={buttonContainerStyle} className="mb-3">
            <Button type="submit" style={buttonStyle}>
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const containerStyle = {
  margin: '20px',
  padding: '20px',
  maxWidth: '800px',
  margin: 'auto',
  backgroundColor: '#f4f4f4',
};

const boxContainerStyle = {
  backgroundColor: '#8293ee',
  padding: '20px',
  borderRadius: '10px',
};

const headingStyle = {
  fontSize: '2em',
  marginBottom: '20px',
};

const formStyle = {
  marginBottom: '20px',
};

const formGroupStyle = {
  marginBottom: '20px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontSize: '1.2em',
  color: '#333',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '1em',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const buttonContainerStyle = {
  marginBottom: '20px',
};

const buttonStyle = {
  backgroundColor: '#ff6c6c',
  color: '#fff',
  borderRadius: '5px',
  padding: '15px 25px',
  fontSize: '1.2em',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

export default ProfileScreen;
