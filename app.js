// Define global variables for the model and video stream
let model, video, objectsList;
let detectedObjects = {};

// Function to fetch recipes based on ingredients
async function fetchRecipes(ingredients) {
    try {
        const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                method: 'recipes.search',
                format: 'json',
                search_expression: ingredients.join(','),
                // You may need to include other parameters like meal type, etc.
            },
            auth: {
                username: 'a8afc165b7fd431cbf4bea47d26b4032',
                password: 'c206fef3245f4b97a55d790151d4b838',
            },
        });
        return response.data.recipes.recipe;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

// Function to display recipes in the UI
function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = ''; // Clear previous content

    recipes.forEach(recipe => {
        const listItem = document.createElement('li');
        listItem.textContent = recipe.recipe_name;
        recipeList.appendChild(listItem);
    });
}

// Function to handle user input and display recipes and snacks
function handleUserInputAndDisplay() {
    // Get user input (ingredients) from the UI
    const listItems = document.querySelectorAll('#objectList li');
    const userIngredients = Array.from(listItems).map(item => item.textContent.trim().toLowerCase());

    // Fetch recipes based on user ingredients
    fetchRecipes(userIngredients)
        .then(recipes => {
            // Filter recipes based on user's ingredients
            const filteredRecipes = recipes.filter(recipe => {
                const recipeIngredients = recipe.ingredients.split(',').map(ingredient => ingredient.trim().toLowerCase());
                return userIngredients.every(ingredient => recipeIngredients.includes(ingredient));
            });

            // Display filtered recipes to the user
            const recipeList = document.getElementById('recipeList');
            recipeList.innerHTML = ''; // Clear previous content

            if (filteredRecipes.length > 0) {
                displayRecipes(filteredRecipes);
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'N/A';
                recipeList.appendChild(listItem);
            }

            // Suggest snacks based on user's ingredients
            const snacks = ['Popcorn', 'Fruit Salad', 'Guacamole', 'Trail Mix']; // Example snacks list
            const suggestedSnacks = snacks.filter(snack => !userIngredients.includes(snack.toLowerCase()));

            // Display suggested snacks to the user
            const snackList = document.getElementById('snackList');
            snackList.innerHTML = ''; // Clear previous content

            if (suggestedSnacks.length > 0) {
                suggestedSnacks.forEach(snack => {
                    const listItem = document.createElement('li');
                    listItem.textContent = snack;
                    snackList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'N/A';
                snackList.appendChild(listItem);
            }
        })
        .catch(error => {
            console.error('Error fetching or filtering recipes:', error);
            // Display "N/A" for both recipes and snacks in case of an error
            const recipeList = document.getElementById('recipeList');
            const snackList = document.getElementById('snackList');
            recipeList.innerHTML = '<li>N/A</li>';
            snackList.innerHTML = '<li>N/A</li>';
        });
}

// Call the function to handle user input and display recipes and snacks when needed
handleUserInputAndDisplay();

// Initialize the objects list
function initObjectsList() {
    objectsList = document.getElementById('objectList');
    console.log('Objects list initialized');
}

// Update the list with detected objects
function updateObjectList(objects) {
    // Add each object to the list if not already present
    objects.forEach(object => {
        const {
            class: className
        } = object;
        if (!(className in detectedObjects)) {
            detectedObjects[className] = true;

            const listItem = document.createElement('li');
            listItem.textContent = className;
            objectsList.appendChild(listItem);
        }
    });
    console.log('Updated object list:', Object.keys(detectedObjects));
}
// Load the COCO-SSD model from TensorFlow.js
async function loadModel() {
    model = await cocoSsd.load();
    console.log('Model loaded');
}

// Detect objects in the video stream and draw bounding boxes
async function detectObjects() {
    const canvas = document.getElementById('canvasElement');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const predictions = await model.detect(video);

    // Update the object list
    const detectedObjects = predictions.map(prediction => ({
        class: prediction.class
    }));
    updateObjectList(detectedObjects);

    // Draw bounding boxes
    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.stroke();
        ctx.fillText(prediction.class, x, y - 5);
    });

    requestAnimationFrame(detectObjects);
}

// Main function to start video streaming and object detection
async function startDetection() {
    initObjectsList(); // Initialize the list
    video = document.getElementById('videoElement');

    if (navigator.mediaDevices.getUserMedia) {
        await loadModel(); // Load the model first
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            detectObjects();
        };
    } else {
        console.error('getUserMedia is not supported by this browser.');
    }
}

// Event listener for the start button click
document.getElementById('startButton').addEventListener('click', startDetection);