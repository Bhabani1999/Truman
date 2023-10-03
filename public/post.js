// post.js
document.getElementById('postContainer').classList.add('loading');
const fetchPostContent = async () => {
    try {

       

        // Get the postId from the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get("id");

        if (!postId) {
            console.error("Post ID not found in URL.");
            return;
        }
        
        // Fetch the specific post's content from your server (e.g., /notion-content/{postId})
        const response = await fetch(`/notion-content/${postId}`);
        const postContent = await response.json();

        // Populate the elements with fetched data
        const iconElement = document.getElementById("icon");
        const pageTitleElement = document.getElementById("pageTitle");
        const contentContainer = document.querySelector(".content-container");
        const h2Container = document.querySelector(".h2-container"); // Added for left column H2 links
        const tagsElement = document.getElementById("tags"); // Add this line
        const creationDateElement = document.getElementById("creationDate"); // Add this line
        // Check if the properties object exists
        if (postContent.properties) {
            iconElement.textContent = postContent.properties.icon;
            pageTitleElement.textContent = postContent.properties.pageTitle;
                
            // Remove the loading container when data is loaded
      document.getElementById('loading-container').style.display = 'none';

      // Add a class to show the content when loading is complete
      document.getElementById('postContainer').classList.remove('loading');
   // Parse the creation date as a Date object
   const creationDate = new Date(postContent.properties.creationDate);
    
   // Format the date as DD Mon 'YY (e.g., 16 Aug '23)
   const day = creationDate.getDate().toString().padStart(2, '0');
const month = (creationDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
const year = creationDate.getFullYear().toString().slice(-2);
const formattedDate = `${day}.${month}.${year}`;

   
   // Update the element with the formatted date
   document.getElementById("formattedDate").textContent = `On ${formattedDate}`;

   // Populate the Tags and Creation Date elements
   tagsElement.innerHTML = `&nbsp; in ${postContent.properties.Tags}`;
        } else {
            console.error("Post properties not found.");
        }

        // Populate content paragraphs, H2 headings, and images with gaps as specified
        if (postContent.content) {
            const contentElements = [];

            // Loop through content and create elements based on their type
            postContent.content.forEach((item, index) => {
                if (item.type === 'text') {
                    const paragraph = document.createElement('p');
                    paragraph.textContent = item.text;
                    paragraph.classList.add('para', 'type-opacity-50');
                    
                    // Apply different padding classes for top and bottom
                    if (index === 0) {
                        paragraph.classList.add('bottom-padding-13');
                    } else if (index === postContent.content.length - 1) {
                        paragraph.classList.add('top-padding-13');
                    } else {
                        paragraph.classList.add('top-padding-13', 'bottom-padding-13');
                    }
                    
                    contentElements.push(paragraph);
                } else if (item.type === 'h2') {
                    const h2 = document.createElement('h2');
                    h2.textContent = item.text;
                    // Apply the h2.heading-md class
                    // Set the id attribute to match the anchor link href
                    const h2Id = `h2-${item.text.replace(/\s+/g, '-').toLowerCase()}`;
                    h2.id = h2Id;
                    
                    // Add a class to the H2 elements in the middle column
                    h2.classList.add('h2-middle');
                    
                    // Apply different padding classes for top and bottom
                    h2.classList.add('top-padding-26', 'bottom-padding-13', 'h2', 'heading-md');
                    
                    contentElements.push(h2);
                    
                    // Create an anchor link for the left column
                    const anchorLink = document.createElement('a');
                    anchorLink.href = `#${h2Id}`;
                    anchorLink.textContent = item.text;
                    anchorLink.classList.add('para', 'type-opacity-50', 'block');
                    h2Container.appendChild(anchorLink);
                } else if (item.type === 'image') {
                    const image = document.createElement('img');
                    image.src = item.url; // Assuming item.url contains the image URL
                    
                    // Apply CSS to make the image fit the width of the container
                    
                    // Apply different padding classes for top and bottom
                    image.classList.add('top-padding-26', 'bottom-padding-26', 'image');
                    image.style.width = '100%';
                    image.style.height = 'auto';
                    contentElements.push(image);
                }

                // Add a gap div after each element (except for the last one)
                if (index < postContent.content.length - 1) {
                    const gap = document.createElement('div');
                    gap.style.height = '0px';
                    contentElements.push(gap);
                }
            });

            // Add the content elements and gaps to the content container
            contentElements.forEach((contentElement) => {
                contentContainer.appendChild(contentElement);
            });
        }
        
        // Add smooth scrolling behavior for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1); // Get the target H2 ID
                const targetH2 = document.getElementById(targetId);
                
                if (targetH2) {
                    // Calculate the scroll position to center the H2 element in the middle column
                    const scrollPosition = targetH2.offsetTop - (window.innerHeight - targetH2.clientHeight) / 2;
                    
                    // Use the scrollPosition to scroll smoothly
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'smooth',
                    });
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
        // Handle errors gracefully (e.g., show an error message to the user)
    }
};

// Call the fetchPostContent function when the page loads
window.addEventListener('load', fetchPostContent);

// Add event listener to "home" link
document.getElementById("homeLink").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent the default behavior of the link
    // Navigate to the root URL
    window.location.href = "/";
});
// Get a reference to the "back to top" container
const backToTopContainer = document.getElementById("backToTopContainer");

// Add event listener to check scroll position
window.addEventListener("scroll", function () {
    // Show/hide the "back to top" container based on scroll position
    if (window.scrollY > 0) {
        // Smoothly fade in by changing opacity to 1
        backToTopContainer.style.opacity = "1";
        // After the fade-in animation completes, set display to block
        setTimeout(() => {
            backToTopContainer.style.display = "block";
        }, 100); // Delayed to ensure transition effect
    } else {
        // Smoothly fade out by changing opacity to 0
        backToTopContainer.style.opacity = "0";
        // After the fade-out animation completes, set display to none
        setTimeout(() => {
            backToTopContainer.style.display = "none";
        }, 300); // Adjust the duration to match the transition duration in CSS
    }
});

// Add event listener to "back to top" link
document.getElementById("backToTop").addEventListener("click", function () {
    // Scroll back to the top of the page
    window.scrollTo({
        top: 0,
        behavior: "smooth", // Smooth scroll to the top
    });
});

