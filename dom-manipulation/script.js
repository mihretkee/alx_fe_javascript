// === Constants for local/session storage ===
const QUOTES_KEY = "storedQuotes";
const LAST_QUOTE_KEY = "lastViewedQuote";
const FILTER_KEY = "lastSelectedFilter";

// === Quote data array ===
let quotes = loadQuotes() || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" }
];

// === DOM references ===
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");

// === Load quotes from localStorage ===
function loadQuotes() {
  const saved = localStorage.getItem(QUOTES_KEY);
  return saved ? JSON.parse(saved) : null;
}

// === Save quotes to localStorage ===
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// === Show a random quote from selected category ===
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = random.text;

  sessionStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(random));
}

// === Restore the last viewed quote from session storage ===
function restoreLastQuote() {
  const last = sessionStorage.getItem(LAST_QUOTE_KEY);
  if (last) {
    const parsed = JSON.parse(last);
    quoteDisplay.textContent = `Last viewed: "${parsed.text}"`;
  }
}

// === Populate both category select and filter dropdowns ===
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // Category for random quote
  categorySelect.innerHTML = "";
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Category for filter
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore previous filter if exists
  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes(); // immediately apply
  }
}

// === Filter quotes based on selected category ===
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  quoteDisplay.innerHTML = "";

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = q.text;
    quoteDisplay.appendChild(p);
  });
}

// === Add a new quote ===
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });

  textInput.value = "";
  categoryInput.value = "";

  saveQuotes();
  populateCategories();
  filterQuotes();
  alert("Quote added!");
}

// === Export quotes as JSON ===
function exportQuotesAsJSON() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// === Import quotes from a JSON file ===
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid file format");

      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// === Event listeners and initial setup ===
newQuoteBtn.addEventListener("click", showRandomQuote);

populateCategories();
restoreLastQuote();
filterQuotes();


