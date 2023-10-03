// Function to fetch page data from your Notion module
const fetchPageData = async () => {
  
  document.getElementById('postContainer').classList.add('loading');

  const maxRetryAttempts = 3;
  let retryCount = 0;

  const fetchDataWithRetry = async () => {
    try {

   
      const response = await fetch('/notion-data'); // Fetch data from your server
      const pageProperties = await response.json();

      // Extract the content property from the response
      const pageData = pageProperties.map((page) => ({
        properties: page,
        content: [], // Initialize an empty array for content (you can populate this later)
      }));
        // Remove the loading container when data is loaded
      document.getElementById('loading-container').style.display = 'none';

      // Add a class to show the content when loading is complete
      document.getElementById('postContainer').classList.remove('loading');
      return pageData;
    } catch (error) {
      console.error("Error:", error);
      if (retryCount < maxRetryAttempts) {
        // Retry after a delay
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        return fetchDataWithRetry(); // Fix this line to return the result of the recursive call
      } else {
        alert("An error occurred while fetching data.");
        throw error; // You may choose to throw the error here to stop further execution
      }
    }
  };

  // Function to populate page content for pages with 'notes' and 'blogs' tags
  const populatePageContent = (pageData) => {
    // Get the middle column container
    const middleColumn = document.querySelector(".column.middle");

    const workInnerContainerTemplate = `
      <div id="work" class="inner-container">
        <h3 class="accent-heading"><span class="accent">_work</span></h3>
        <div style="height: 26px;"></div>
      </div>
    `;

    // Define a template for the 'notes' inner-container
    const notesInnerContainerTemplate = `
      <div class="inner-container">
        <div class="row">
          <div class="left-content">
            <a class="para type pageTitleLink" href=""></a>
          </div>
          <div class="right-content">
            <span class="number type-opacity-50 creationDate">12.04.36</span>
          </div>
        </div>
        <p class="para type-opacity-50 pageDescription">Page Description</p>
        <div style="height: 13px;"></div>
      </div>
    `;

    const blogsheadingTemplate = `
      <div style="height: 26px;"></div>
      <div id="notes" class="inner-container">
        <h3 class="accent-heading"><span class="accent">_notes</span></h3>
        <div style="height: 26px;"></div>
      </div>
    `;

    // Define a template for the 'blogs' inner-container
    const blogsInnerContainerTemplate = `
      <div class="inner-container">
        <div class="row">
          <div class="left-content">
            <a class="para type pageTitleLink" href=""></a>
          </div>
          <div class="right-content">
            <span class="number type-opacity-50 creationDate">12.04.36</span>
          </div>
        </div>
        <p class="para type-opacity-50 pageDescription hidden">Page Description</p>
      </div>
    `;

    // Filter pageData for 'notes' and 'blogs' separately
    const notesPageData = pageData.filter((page) => page.properties.Tags === 'work');
    const blogsPageData = pageData.filter((page) => page.properties.Tags === 'notes');

    // Function to populate a section with given data and template
    const populateSection = (sectionData, innerContainerTemplate) => {
      sectionData.forEach((pageDataItem, index) => {
        // Create a new div element using the template
        const newInnerContainer = document.createElement("div");
        newInnerContainer.innerHTML = innerContainerTemplate;

        // Update the title and description with page data
        const pageTitleLink = newInnerContainer.querySelector(".pageTitleLink");
        pageTitleLink.textContent = pageDataItem.properties.pageTitle;

        // Set the href to the post.html with the post ID
        pageTitleLink.href = `post.html?id=${pageDataItem.properties.id}`;

        // Update the creation date and description
        const creationDateElement = newInnerContainer.querySelector(".creationDate");
creationDateElement.textContent = formatDate(pageDataItem.properties.creationDate);
        newInnerContainer.querySelector(".pageDescription").textContent = pageDataItem.properties.pageDescription;

        // Append the populated inner-container to the middle column
        middleColumn.appendChild(newInnerContainer);
      });
    };

    // Add a separator or section title between 'notes' and 'blogs'
    middleColumn.innerHTML += workInnerContainerTemplate;

    // Populate the 'notes' section with 'notes' template
    populateSection(notesPageData, notesInnerContainerTemplate);

    // Add a separator or section title between 'notes' and 'blogs'
    middleColumn.innerHTML += blogsheadingTemplate;
    
    // Populate the 'blogs' section with 'blogs' template
    populateSection(blogsPageData, blogsInnerContainerTemplate);
  }; 

  // Main function to fetch data and populate content
  const main = async () => {
    try {
      const pageData = await fetchDataWithRetry(); // Call the fetch function
      populatePageContent(pageData);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Call the main function when the page loads
  window.addEventListener('load', main);
};

fetchPageData(); // Call fetchPageData to initiate the data fetching process

// Function to scroll to a section by its ID
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}


function formatDate(creationDate) {
  const date = new Date(creationDate); // Parse the creationDate string

  // Get the day, month, and last two digits of the year
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear().toString().slice(-2);

  return `${day}.${month}.${year}`;
}
