let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");

// Create and insert the Add Quote Form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const heading = document.createElement("h3");
  heading.textContent = "Add a New Quote";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(heading);
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Load unique categories into dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Display a random quote from the selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Add a new quote
function addQuote() {
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });

  quoteInput.value = "";
  categoryInput.value = "";

  populateCategories();
  alert("Quote added successfully!");
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize
populateCategories();
createAddQuoteForm();

// ========== Quotes Storage Key ==========
const QUOTES_KEY = "storedQuotes";
const LAST_QUOTE_KEY = "lastViewedQuote";

// ========== Initial Quotes (default) ==========
let quotes = loadQuotes() || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
];

// ========== DOM References ==========
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");

// ========== Load & Save Functions ==========
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem(QUOTES_KEY);
  return saved ? JSON.parse(saved) : null;
}

// ========== Show Random Quote ==========
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = random.text;

  // Save to session storage
  sessionStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(random));
}

// ========== Populate Categories ==========
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ========== Add New Quote ==========
function addQuote() {
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both quote and category.");
    return;
  }

  quotes.push({ text, category });
  quoteInput.value = "";
  categoryInput.value = "";
  saveQuotes();
  populateCategories();
  alert("Quote added!");
}

// ========== Create Add Quote Form ==========
function createAddQuoteForm() {
  const container = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  container.appendChild(title);
  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);

  document.body.appendChild(container);
}

// ========== Create JSON Import/Export Controls ==========
function createJSONControls() {
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.addEventListener("click", exportQuotesAsJSON);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  document.body.appendChild(document.createElement("hr"));
  document.body.appendChild(exportBtn);
  document.body.appendChild(importInput);
}

// ========== Export JSON ==========
function exportQuotesAsJSON() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// ========== Import JSON ==========
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ========== Restore Last Viewed Quote ==========
function restoreLastQuote() {
  const last = sessionStorage.getItem(LAST_QUOTE_KEY);
  if (last) {
    const parsed = JSON.parse(last);
    quoteDisplay.textContent = `Last viewed: "${parsed.text}"`;
  }
}

// ========== Init ==========
newQuoteBtn.addEventListener("click", showRandomQuote);

populateCategories();
createAddQuoteForm();
createJSONControls();
restoreLastQuote();

