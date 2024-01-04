import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { MdInfo } from 'react-icons/md';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `/api/orders/mine`,
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [userInfo]);
  
  const removeProductHandler = async (orderId) => {
    const shouldCancel = window.confirm("Do you want to cancel your order?");
    if (shouldCancel) {
      try {
        const response = await axios.delete(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
  
        console.log('Cancellation Response:', response.data);
  
        if (response.status === 200) {
          console.log(`Order canceled successfully: ${orderId}`);
          const { data } = await axios.get(`/api/orders/mine`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } else {
          console.error(`Failed to cancel order: ${orderId}`);
        }
      } catch (error) {
        console.error('Cancellation Error:', error.response.data);
  
        if (error.response && error.response.status === 401) {
          if (error.response.data.message === 'Invalid Admin Token') {
            console.error('User does not have admin permissions.');
          }
        }
  
        console.error(`Error canceling order: ${getError(error)}`);
      }
    }
  };
  
  const downloadReport = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/report`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });

      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = `OrderReport_${orderId}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  return (
    <div style={{ margin: '20px', padding: '20px', maxWidth: '800px' }}>
      <Helmet>
        <title>Order History</title>
      </Helmet>

      <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Order History</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger" style={{ marginBottom: '20px' }}>{error}</MessageBox>
      ) : (
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>DATE</th>
              <th style={tableHeaderStyle}>TOTAL</th>
              <th style={tableHeaderStyle}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tableCellStyle}>{order._id}</td>
                <td style={tableCellStyle}>{order.createdAt.substring(0, 10)}</td>
                <td style={tableCellStyle}>{order.totalPrice.toFixed(2)}</td>
                <td style={tableCellStyle}>
                  <Link to={`/order/${order._id}`}>
                    <MdInfo />
                  </Link>
                  <button onClick={() => downloadReport(order._id)}>Download Report</button>
                  <button onClick={() => removeProductHandler(order._id)}>
                    Cancel Order Here
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#3498db',
  color: '#fff',
};

const tableCellStyle = {
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#ecf0f1',
};
