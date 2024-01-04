import React, { useEffect, useReducer } from "react";
import {  useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { getError } from "../utils";
import { Helmet } from "react-helmet-async";
import { Row, Col } from 'react-bootstrap';

import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "react-bootstrap/Button";
import Product from "../components/Product";


const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload.products,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};



export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search); 
  const category = sp.get("category") || "all";
  const query = sp.get("query") || "all";
  const price = sp.get("price") || "all";
  const rating = sp.get("rating") || "all";
  const order = sp.get("order") || "newest";

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        let productData;

        const productResponse = await axios.get(
          `/api/products/search?query=${query}`
        );

        if (productResponse.data.products.length > 0) {
          productData = productResponse.data;
        } else {
         
          const categoryResponse = await axios.get(
            `/api/products/search?category=${query}`
          );
          productData = categoryResponse.data;
        }

        dispatch({ type: "FETCH_SUCCESS", payload: productData });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };

    fetchData();
  }, [category, query]);

  
  


  return (
    <div>
      <Helmet>
        <title>Search Foods</title>
      </Helmet>
      <Row>
        <Col md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={10}>
                  <div>
                    {products.length > 0 ? (
                      <p>Search medicine is not availabe, suggesting alternative medicine </p>
                    ) : (
                      <>
                        {products.length} Results
                        {query !== "all" && " : " + query}
                        {category !== "all" && " : " + category}
                        {price !== "all" && " : Price " + price}
                        {rating !== "all" && " : Rating " + rating + " & up"}
                        {query !== "all" ||
                        category !== "all" ||
                        rating !== "all" ||
                        price !== "all" ? (
                          <Button
                            variant="light"
                            onClick={() => navigate("/search")}
                          >
                            <i className="fas fa-times-circle"></i>
                          </Button>
                        ) : null}
                      </>
                    )}
                  </div>
                </Col>
              </Row>
              {products.length > 0 && (
                <Row>
                  {products.map((product) => (
                    <Col sm={6} lg={4} className="mb-3" key={product._id}>
                      <Product product={product}></Product>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
              
