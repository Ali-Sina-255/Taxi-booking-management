import { useState, useEffect } from "react";
import apiClient from "../api/axiosConfig"; // You need to create this file as shown in the previous response

export const useProductFilters = (categoryName) => {
  const [filterOptions, setFilterOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndGroupFilters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch all attribute types
        const typesResponse = await apiClient.get("/category/attribute/");
          const attributeTypes = typesResponse.data.results;
          
        // 2. Fetch ALL attribute values (inefficient but necessary with current API)
        const valuesResponse = await apiClient.get(
          "/category/attribute"
        );// Assumes this endpoint lists all values
        const allAttributeValues = valuesResponse.data.results;

        // 3. Group values by their attribute type ID on the client-side
        const groupedFilters = attributeTypes.map((type) => ({
          ...type,
          values: allAttributeValues.filter((val) => val.attribute === type.id),
        }));

        // Manually add the "Genres" filter from the reference site
        const genresFilter = {
          id: "genres",
          name: "Genres",
          attribute_type: "checkbox",
          values: [
            { id: "homme", attribute_value: "Homme" },
            { id: "femme", attribute_value: "Femme" },
            { id: "enfant", attribute_value: "Enfant" },
          ],
        };

        setFilterOptions([genresFilter, ...groupedFilters]);
      } catch (err) {
        console.error("Failed to fetch filter data:", err);
        setError("Could not load filters.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndGroupFilters();
  }, [categoryName]); // Refetch if the category changes

  return { filterOptions, isLoading, error };
};
