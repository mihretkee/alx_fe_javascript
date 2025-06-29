// === Storage keys ===
const QUOTES_KEY = "storedQuotes";
const LAST_QUOTE_KEY = "lastViewedQuote";
const FILTER_KEY = "lastSelectedFilter";

// === Initial quotes array ===
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
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const syncBtn = document.getElementById("syncBtn");
const syncNotification = document.getElementById("syncNotification");

// === Load quotes from localStorage ===
function loadQuotes() {
  const saved = localStorage.getItem(QUOTES_KEY);
  return saved ? JSON.parse(saved) : null;
}

// === Save quotes to localStorage ===
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// === Show random quote based on selected category ===
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

// === Restore last viewed quote from session storage ===
function restoreLastQuote() {
  const last = sessionStorage.getItem(LAST_QUOTE_KEY);
  if (last) {
    const parsed = JSON.parse(last);
    quoteDisplay.textContent = `Last viewed: "${parsed.text}"`;
  }
}

// === Populate categories dropdowns ===
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // For random quote category select
  categorySelect.innerHTML = "";
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // For filter dropdown
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last filter
  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

// === Filter quotes based on selected filter category ===
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

// === Add quote form creation function (required by school) ===
function createAddQuoteForm() {
  const container = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  container.appendChild(title);
  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);

  // Insert the form above the export/import buttons
  const exportBtnElement = document.getElementById("exportBtn");
  exportBtnElement.parentNode.insertBefore(container, exportBtnElement);
}

// === Add a new quote to the list ===
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

// === Export quotes as JSON file ===
function exportQuotesAsJSON() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// === Import quotes from JSON file ===
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

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
  reader.readAsText(file);
}

// === Simulated server fetch for quotes ===
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    if (!res.ok) throw new Error("Failed to fetch server data");
    const data = await res.json();
    return data.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (err) {
    console.error("Fetch server quotes error:", err);
    return [];
  }
}

// === Sync local quotes with server quotes, server takes precedence ===
async function syncDataWithServer() {
  syncNotification.textContent = "Syncing data with server...";

  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length === 0) {
    syncNotification.textContent = "No server data fetched.";
    return;
  }

  let conflictsResolved = 0;

  serverQuotes.forEach(sq => {
    const index = quotes.findIndex(lq => lq.text === sq.text);
    if (index !== -1) {
      // Conflict: overwrite local quote with server quote
      quotes[index] = sq;
      conflictsResolved++;
    } else {
      // New quote from server
      quotes.push(sq);
    }
  });

  saveQuotes();
  populateCategories();
  filterQuotes();

  syncNotification.textContent = `Sync complete. Conflicts resolved: ${conflictsResolved}`;
  setTimeout(() => (syncNotification.textContent = ""), 5000);
}

// === Initialize app ===
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotesAsJSON);
importFileInput.addEventListener("change", importFromJsonFile);
syncBtn.addEventListener("click", syncDataWithServer);

populateCategories();
createAddQuoteForm();
restoreLastQuote();
filterQuotes();

// Optional: periodic syncing every 30 seconds
setInterval(syncDataWithServer, 30000);





