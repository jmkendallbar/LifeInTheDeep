export async function fetchDataFromAPI(page) {
  try {
    const response = await fetch(`http://localhost:8000/load-data/${page}`);
    if (!response.ok) {
      return { success: false, error: "Failed to fetch data from API" };
    }
    const { batchData, totalRange, batchs } = await response.json();
    return { success: true, data: batchData, totalRange, batchs };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { success: false, error: "Error fetching data from API" };
  }
}
