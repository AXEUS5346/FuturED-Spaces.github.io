// Store pages content in memory
let pages = {
    'welcome': {
        name: 'Welcome Page',
        content: document.querySelector('.editor').innerHTML
    }
};

let currentPageId = 'welcome';

// Format text functions
function formatText(command) {
    document.execCommand(command, false, null);
    updateToolbarState();
    focusEditor();
}

function addHeading() {
    document.execCommand('formatBlock', false, '<h2>');
    updateToolbarState();
    focusEditor();
}

function addList(type) {
    if (type === 'bullet') {
        document.execCommand('insertUnorderedList', false, null);
    } else {
        document.execCommand('insertOrderedList', false, null);
    }
    updateToolbarState();
    focusEditor();
}

function addCodeBlock() {
    const pre = document.createElement('pre');
    pre.innerHTML = '<code>// Your code here</code>';
    insertAtCursor(pre);
    updateToolbarState();
    focusEditor();
}

function addLink() {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
        document.execCommand('createLink', false, url);
    }
    updateToolbarState();
    focusEditor();
}

function insertAtCursor(element) {
    const selection = window.getSelection();
    if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(element);
    }
}

function focusEditor() {
    const editor = document.querySelector('.editor');
    editor.focus();
}

// Update toolbar state based on current selection
function updateToolbarState() {
    const commands = {
        'bold': 'bold',
        'italic': 'italic',
        'underline': 'underline'
    };

    Object.entries(commands).forEach(([className, command]) => {
        const button = document.querySelector(`button[onclick="formatText('${command}')"]`);
        if (button) {
            button.classList.toggle('active', document.queryCommandState(command));
        }
    });

    // Check for lists
    const bulletButton = document.querySelector('button[onclick="addList(\'bullet\')"]');
    const numberButton = document.querySelector('button[onclick="addList(\'number\')"]');
    
    if (bulletButton) {
        bulletButton.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
    }
    if (numberButton) {
        numberButton.classList.toggle('active', document.queryCommandState('insertOrderedList'));
    }

    // Check for headings
    const headingButton = document.querySelector('button[onclick="addHeading()"]');
    if (headingButton) {
        const formatBlock = document.queryCommandValue('formatBlock');
        headingButton.classList.toggle('active', /^h[1-6]$/i.test(formatBlock));
    }
}

// Page management
function addNewPage() {
    const pageId = `page_${Date.now()}`;
    const pageName = `New Page ${Object.keys(pages).length}`;
    
    pages[pageId] = {
        name: pageName,
        content: '<h1>New Page</h1><p>Start typing here...</p>'
    };
    
    const pageElement = document.createElement('div');
    pageElement.className = 'page';
    pageElement.setAttribute('data-id', pageId);
    pageElement.innerHTML = `
        <i class="fas fa-file"></i>
        <span>${pageName}</span>
    `;
    
    const addPageButton = document.querySelector('.add-page');
    addPageButton.parentNode.insertBefore(pageElement, addPageButton);
    
    initializePageEvents(pageElement);
    switchPage(pageId);
    saveToLocalStorage();
}

function initializePageEvents(pageElement) {
    pageElement.addEventListener('click', () => {
        const pageId = pageElement.getAttribute('data-id');
        switchPage(pageId);
    });
}

function switchPage(pageId) {
    // Save current page content
    const editor = document.querySelector('.editor');
    pages[currentPageId].content = editor.innerHTML;
    
    // Update active page styling
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelector(`[data-id="${pageId}"]`).classList.add('active');
    
    // Load new page content
    editor.innerHTML = pages[pageId].content;
    currentPageId = pageId;
    focusEditor();
    saveToLocalStorage();
}

// Auto-save functionality
const editor = document.querySelector('.editor');
editor.addEventListener('input', () => {
    if (currentPageId && pages[currentPageId]) {
        pages[currentPageId].content = editor.innerHTML;
        saveToLocalStorage();
    }
});

// Local storage functions
function saveToLocalStorage() {
    localStorage.setItem('futurED_pages', JSON.stringify(pages));
    localStorage.setItem('futurED_currentPage', currentPageId);
}

function loadFromLocalStorage() {
    const savedPages = localStorage.getItem('futurED_pages');
    const savedCurrentPage = localStorage.getItem('futurED_currentPage');
    
    if (savedPages) {
        pages = JSON.parse(savedPages);
        
        // Recreate page elements
        const pagesContainer = document.querySelector('.pages');
        const addPageButton = pagesContainer.querySelector('.add-page');
        
        Object.entries(pages).forEach(([pageId, pageData]) => {
            if (document.querySelector(`[data-id="${pageId}"]`)) return;
            
            const pageElement = document.createElement('div');
            pageElement.className = 'page';
            pageElement.setAttribute('data-id', pageId);
            pageElement.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${pageData.name}</span>
            `;
            
            pagesContainer.insertBefore(pageElement, addPageButton);
            initializePageEvents(pageElement);
        });
        
        if (savedCurrentPage && pages[savedCurrentPage]) {
            switchPage(savedCurrentPage);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page events
    document.querySelectorAll('.page').forEach(initializePageEvents);
    
    // Load saved data
    loadFromLocalStorage();
    
    // Focus editor
    focusEditor();

    // Add selection change listener for toolbar state
    document.addEventListener('selectionchange', updateToolbarState);
    
    // Add input listener for toolbar state
    editor.addEventListener('input', updateToolbarState);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                formatText('bold');
                break;
            case 'i':
                e.preventDefault();
                formatText('italic');
                break;
            case 'u':
                e.preventDefault();
                formatText('underline');
                break;
        }
    }
});
