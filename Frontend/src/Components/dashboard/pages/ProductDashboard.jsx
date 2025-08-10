import React, { useState } from "react";
import ProductList from "./ProductList";
import ProductManager from "./ProductManager";

/**
 * This is the new parent component that manages the state for both the list and the form.
 * It decides which component to show and passes the necessary data between them.
 */
export default function ProductDashboard() {
  // State to decide which view is active: 'list' or 'form'.
  const [activeView, setActiveView] = useState("list");

  // State to hold the product object when we want to edit.
  // It will be 'null' when we are adding a new product.
  const [productToEdit, setProductToEdit] = useState(null);

  /**
   * This function is passed to ProductList.
   * When the "Edit" button is clicked, it saves the product data and switches the view to the form.
   */
  const handleEditClick = (product) => {
    setProductToEdit(product); // Store the product data to be edited.
    setActiveView("form"); // Switch the view to the form.
  };

  /**
   * This function is passed to ProductList.
   * When the "+ Add New Product" button is clicked, it clears any old product data and switches to the form.
   */
  const handleAddNewClick = () => {
    setProductToEdit(null); // Ensure there is no product data.
    setActiveView("form"); // Switch the view to the form.
  };

  /**
   * This function is passed to ProductManager.
   * After the form is successfully submitted, it clears the product data and switches back to the list view.
   */
  const handleFormSubmit = () => {
    setProductToEdit(null);
    setActiveView("list");
  };

  return (
    <div>
      {/* Conditionally render the ProductList */}
      {activeView === "list" && (
        <ProductList
          onEditClick={handleEditClick}
          onAddNewClick={handleAddNewClick}
        />
      )}

      {/* Conditionally render the ProductManager form */}
      {activeView === "form" && (
        <ProductManager
          productToEdit={productToEdit}
          onFormSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}
