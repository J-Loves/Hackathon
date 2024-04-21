let foodItems = []; // Array to store food items

function addItem() {
    const foodInput = document.getElementById('foodInput').value.trim();
    if (foodInput === '') return; // Skip empty inputs

    foodItems.push(foodInput); // Add to the array
    foodItems.sort(); // Sort alphabetically

    renderFoodList();
    document.getElementById('foodInput').value = ''; // Clear input field
}

function renderFoodList() {
    const foodListContainer = document.getElementById('foodList');
    foodListContainer.innerHTML = ''; // Clear previous content

    let currentLetter = '';
    foodItems.forEach(item => {
        const firstLetter = item[0].toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            const letterMarker = document.createElement('div');
            letterMarker.textContent = firstLetter;
            letterMarker.classList.add('letter-marker');
            foodListContainer.appendChild(letterMarker);
        }

        const listItem = document.createElement('li');
        listItem.textContent = item;
        foodListContainer.appendChild(listItem);
    });
}
