// content.js

(function() {
  'use strict';

  // Set to keep track of processed product items to avoid duplicates
  const processedItems = new WeakSet();

  // Function to process a product item
  function processProductItem(item) {
    console.log('Processing product item...', item);
    // Check if we have already processed this item
    if (processedItems.has(item)) {
      return;
    }

    // Find the reviews block within the item
    const reviewsBlock =
      item.querySelector('[data-cy="reviews-block"]') ||
      item.querySelector('.a-row.a-size-small');

    if (reviewsBlock) {
      const ratingElement = reviewsBlock.querySelector('.a-icon-alt');
      const reviewsElement = reviewsBlock.querySelector('.a-size-base');

      if (ratingElement && reviewsElement) {
        // Extract numerical values using regular expressions
        const ratingMatch = ratingElement.textContent.match(/([\d.]+) out of 5/);
        const reviewsMatch = reviewsElement.textContent.replace(/,/g, '').match(/(\d+)/);

        if (ratingMatch && reviewsMatch) {
          const stars = parseFloat(ratingMatch[1]);
          const reviews = parseInt(reviewsMatch[1]);

          // Proceed to calculate beta distribution and update the page
          calculateAndDisplayBetaStars(reviewsBlock, stars, reviews);

          // Mark this item as processed
          processedItems.add(item);
        }
      }
    }
  }

  // Function to calculate beta distribution and display the stars
  function calculateAndDisplayBetaStars(reviewsBlock, stars, reviews) {
    const intensities = calculateColorIntensities(stars, reviews);

    // Create a container for the new stars
    const starContainer = document.createElement('div');
    starContainer.style.display = 'flex';
    starContainer.style.marginTop = '5px';

    // Create five stars with varying intensities
    for (let i = 0; i < 5; i++) {
      const starWrapper = document.createElement('div');
      starWrapper.style.position = 'relative';
      starWrapper.style.width = '16px';
      starWrapper.style.height = '16px';
      starWrapper.style.marginRight = '2px';

      // Create the white star as the background
      const whiteStar = document.createElement('img');
      whiteStar.src = chrome.runtime.getURL('white-star.png');
      whiteStar.style.position = 'absolute';
      whiteStar.style.width = '100%';
      whiteStar.style.height = '100%';

      // Create the blue star overlay
      const blueStar = document.createElement('img');
      blueStar.src = chrome.runtime.getURL('blue-star.png');
      blueStar.style.position = 'absolute';
      blueStar.style.width = '100%';
      blueStar.style.height = '100%';
      blueStar.style.opacity = intensities[i];

      // Append the stars to the wrapper
      starWrapper.appendChild(whiteStar);
      starWrapper.appendChild(blueStar);

      starContainer.appendChild(starWrapper);
    }


    // Append the new star container after the existing reviews block
    reviewsBlock.appendChild(starContainer);
  }

  // Function to calculate color intensities
  function calculateColorIntensities(stars, reviews) {
    if (reviews === 0) {
      // If no reviews, set all intensities to zero
      return ['0', '0', '0', '0', '0'];
    }

    const positiveOutcomes = (stars / 5) * reviews;
    const negativeOutcomes = reviews - positiveOutcomes;

    const a = positiveOutcomes + 1; // Adjusted alpha
    const b = negativeOutcomes + 1; // Adjusted beta

    const intensities = [];
    for (let i = 0; i < 5; i++) {
      const x1 = i / 5;
      const x2 = (i + 1) / 5;
      let intensity = betaCDF(x2, a, b) - betaCDF(x1, a, b);
      intensity = Math.min(Math.max(intensity, 0), 1); // Clamp between 0 and 1
      intensities.push(intensity.toFixed(2)); // Round to two decimal places
    }
    return intensities;
  }

  // Function to compute the beta cumulative distribution function
  function betaCDF(x, a, b) {
    return jStat.beta.cdf(x, a, b);
  }

  // Function to process all product items on the page
  function processAllProductItems() {
    console.log('Processing all product items...');
    // Find all product items
    const productItems = document.querySelectorAll('[data-component-type="s-search-result"]');

    productItems.forEach((item) => {
      processProductItem(item);
    });
  }

  // Function to process product detail pages
  function processProductDetailPage() {
    console.log('Processing product detail page...');
    // Check if we are on a product detail page
    const productTitle = document.getElementById('productTitle');

    if (productTitle) {
      console.log('Product detail page detected!', productTitle);
      // We are on a product detail page
      const ratingElement = document.querySelector('#averageCustomerReviews .a-icon-alt');
      const reviewsElement = document.querySelector('#acrCustomerReviewText');

      if (ratingElement && reviewsElement) {
        // Extract numerical values using regular expressions
        const ratingMatch = ratingElement.textContent.match(/([\d.]+) out of 5/);
        const reviewsMatch = reviewsElement.textContent.replace(/,/g, '').match(/(\d+)/);

        if (ratingMatch && reviewsMatch) {
          const stars = parseFloat(ratingMatch[1]);
          const reviews = parseInt(reviewsMatch[1]);

          // Proceed to calculate beta distribution and update the page
          calculateAndDisplayBetaStarsDetailPage(stars, reviews);
        }
      }
    }
  }

  function calculateAndDisplayBetaStarsDetailPage(stars, reviews) {
    const intensities = calculateColorIntensities(stars, reviews);

    // Create a container for the new stars
    const starContainer = document.createElement('div');
    starContainer.style.display = 'flex';
    starContainer.style.marginTop = '5px';

    // Create five stars with varying intensities
    for (let i = 0; i < 5; i++) {
      const starWrapper = document.createElement('div');
      starWrapper.style.position = 'relative';
      starWrapper.style.width = '16px';
      starWrapper.style.height = '16px';
      starWrapper.style.marginRight = '2px';

      // Create the white star as the background
      const whiteStar = document.createElement('img');
      whiteStar.src = chrome.runtime.getURL('white-star.png');
      whiteStar.style.position = 'absolute';
      whiteStar.style.width = '100%';
      whiteStar.style.height = '100%';

      // Create the blue star overlay
      const blueStar = document.createElement('img');
      blueStar.src = chrome.runtime.getURL('blue-star.png');
      blueStar.style.position = 'absolute';
      blueStar.style.width = '100%';
      blueStar.style.height = '100%';
      blueStar.style.opacity = intensities[i];

      // Append the stars to the wrapper
      starWrapper.appendChild(whiteStar);
      starWrapper.appendChild(blueStar);

      starContainer.appendChild(starWrapper);
    }

    // Insert the container after the original star rating
    const averageCustomerReviews = document.getElementById('averageCustomerReviews');

    if (averageCustomerReviews) {
      averageCustomerReviews.appendChild(starContainer);
    }
  }

  // MutationObserver to watch for new product items being added
  const observer = new MutationObserver((mutations) => {
    console.log('Mutation observed:', mutations);
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('[data-component-type="s-search-result"]')) {
            processProductItem(node);
          } else {
            // If node is not a product item, check if it contains product items
            const productItems = node.querySelectorAll('[data-component-type="s-search-result"]');
            productItems.forEach((item) => {
              processProductItem(item);
            });
          }
        }
      });
    });
  });

  console.log('Amazon Review Sentiment Analysis Extension loaded!');

  // Start observing the main container for changes
  const mainContainer = document.getElementById('search') || document.body;
  observer.observe(mainContainer, { childList: true, subtree: true });

  // Ensure the script runs after the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      processAllProductItems();
      processProductDetailPage();
    });
  } else {
    processAllProductItems();
    processProductDetailPage();
  }
})();
