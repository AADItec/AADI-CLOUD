// ===== PRUDENCE AI v2 - ADAPTED SCRIPT =====
// Adapted from original script to work with Prudence AI v2 UI

import { auth, database } from './core/firebase.js';
import { loginUser, signUpUser, logoutUser, checkAuthState } from './core/auth.js';
import { loadFaqsFromFirebase, getFaqAnswer } from './modules/faq.js';
import { aiModels } from './modules/aiModels.js';
import { initializeThemeToggle } from './modules/theme.js';
import { cerebrasAPI } from './modules/cerebras.js';
import { geminiAPI } from './modules/gemini.js';
import { FusionService } from './modules/fusion.js';
import * as templateModule from './modules/template.js';

(async () => {
    await templateModule.loadTemplates();
})();

import { ref, set, get, push, remove } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// Configure marked.js to use highlight.js for code blocks
if (typeof marked !== 'undefined') {
    marked.setOptions({
        highlight: function(code, lang) {
            if (window.hljs) {
                if (lang && window.hljs.getLanguage(lang)) {
                    return window.hljs.highlight(code, { language: lang }).value;
                } else {
                    return window.hljs.highlightAuto(code).value;
                }
            }
            return code;
        }
    });
}

// Test functions (keeping your existing test functions)
window.testGeminiAPI = async function() {
    console.log('🧪 Testing Gemini API connection...');
    try {
        const result = await geminiAPI.testConnection();
        if (result.success) {
            console.log('✅ Gemini API test successful!');
            alert('Gemini API test successful! Check console for details.');
        } else {
            console.error('❌ Gemini API test failed:', result.error);
            alert('Gemini API test failed: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Test error:', error);
        alert('Test error: ' + error.message);
    }
};

window.testFusion = async function() {
    console.log('🧪 Testing fusion functionality...');
    const testResponses = [
        "AI works through neural networks and machine learning algorithms.",
        "Artificial intelligence processes data to make intelligent decisions.",
        "Machine learning enables computers to learn from experience."
    ];
    
    try {
        const fusionPrompt = `Here are responses from 3 different AI models about: "What is AI?"

Model 1 (Test Model 1): ${testResponses[0]}
Model 2 (Test Model 2): ${testResponses[1]}
Model 3 (Test Model 3): ${testResponses[2]}

Please synthesize these responses into one comprehensive, coherent answer.`;

        const result = await geminiAPI.generateResponse(fusionPrompt, {
            model: 'gemini-2.5-flash',
            temperature: 0.7,
            maxTokens: 500
        });
        
        console.log('✅ Test fusion successful!');
        alert('Test fusion successful! Check console for details.');
        
    } catch (error) {
        console.error('❌ Test fusion failed:', error);
        alert('Test fusion failed: ' + error.message);
    }
};

window.testSimpleGemini = async function() {
    console.log('🧪 Testing simple Gemini API call...');
    try {
        const result = await geminiAPI.generateResponse("Hello! Please respond with a simple greeting.", {
            model: 'gemini-2.5-flash',
            temperature: 0.7,
            maxTokens: 100
        });
        
        console.log('✅ Simple Gemini test successful!');
        alert('Simple Gemini test successful! Check console for details.');
        
    } catch (error) {
        console.error('❌ Simple Gemini test failed:', error);
        alert('Simple Gemini test failed: ' + error.message);
    }
};

window.checkGeminiModels = async function() {
    console.log('🔍 Checking available Gemini models...');
    try {
        const models = await geminiAPI.getAvailableModels();
        console.log('✅ Available Gemini models:', models);
        console.log('🎯 Our configured models:', geminiAPI.listModels());
        console.log('⚙️ Default model:', geminiAPI.defaultModel);
        alert('Gemini models check complete! Check console for details.');
    } catch (error) {
        console.error('❌ Gemini models check failed:', error);
        alert('Gemini models check failed: ' + error.message);
    }
};

window.testAuthModal = function() {
    console.log('🧪 Testing auth modal functionality...');
    if (window.prudenceAI) {
        console.log('✅ PrudenceAI instance found');
        console.log('🔍 Auth modal element:', !!window.prudenceAI.authModal);
        console.log('🔍 Modal submit button:', !!window.prudenceAI.modalSubmit);
        console.log('🔍 Modal close button:', !!window.prudenceAI.modalClose);
        console.log('🔍 Modal toggle button:', !!window.prudenceAI.toggleModalAuth);
        
        // Test showing the modal
        window.prudenceAI.showAuthModal(true);
        
        // Test if modal is visible
        setTimeout(() => {
            const modal = document.getElementById('authModal');
            if (modal) {
                console.log('🔍 Modal display style:', modal.style.display);
                console.log('🔍 Modal computed style:', window.getComputedStyle(modal).display);
                console.log('🔍 Modal is visible:', modal.style.display !== 'none');
            }
        }, 100);
    } else {
        console.error('❌ PrudenceAI instance not found');
    }
};

window.testModalButtons = function() {
    console.log('🧪 Testing modal button functionality...');
    
    // Check if modal elements exist
    const modal = document.getElementById('authModal');
    const submitBtn = document.getElementById('modalSubmit');
    const closeBtn = document.getElementById('modalClose');
    const toggleBtn = document.getElementById('toggleModalAuth');
    
    console.log('🔍 Modal elements found:');
    console.log('- Modal:', !!modal);
    console.log('- Submit button:', !!submitBtn);
    console.log('- Close button:', !!closeBtn);
    console.log('- Toggle button:', !!toggleBtn);
    
    if (modal) {
        console.log('🔍 Modal display style:', modal.style.display);
        console.log('🔍 Modal computed display:', window.getComputedStyle(modal).display);
    }
    
    // Test clicking the submit button
    if (submitBtn) {
        console.log('🔍 Testing submit button click...');
        submitBtn.click();
    }
    
    // Test clicking the close button
    if (closeBtn) {
        console.log('🔍 Testing close button click...');
        closeBtn.click();
    }
    
    // Test clicking the toggle button
    if (toggleBtn) {
        console.log('🔍 Testing toggle button click...');
        toggleBtn.click();
    }
};

// Firebase initialization check
const checkFirebaseInit = () => {
    try {
        return auth && database;
    } catch (error) {
        console.error('Error checking Firebase initialization:', error);
        return false;
    }
};

// Prudence AI v2 Chat Interface Class
class PrudenceAIV2 {
    constructor() {
        // Core properties
        this.compareMode = true;
        this.selectedModels = ['llama4-maverick-17b-128e-instruct', 'gemini-2.0-flash', 'qwen-3-32b'];
        this.currentChatId = null;
        this.chatHistory = [];
        this.messages = [];
        this.faqs = [];
        this.personalityFaqs = [];
        this.modelTemperatures = {};
        this.aiModels = aiModels;
        this.fusionService = new FusionService(geminiAPI);
        this.auth = auth;
        this.database = database;
        this.firebaseConfigured = checkFirebaseInit();
        
        // Configuration
        this.appName = 'AADI CLOUD';
        this.maxChatHistory = 20;
        this.maxMessageLength = 1000;
        this.maxAiModels = 3;
        
        // Template suggestions configuration
        this.templateSuggestions = templateModule.suggestions;

        // Initialize UI elements
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeUI();
        
        // Add guide download button between ensemble mode and right sidebar buttons
        setTimeout(() => {
            const header = document.querySelector('header');
            if (header && this.compareToggle && this.expandRightSidebarBtn) {
                header.insertBefore(this.guideDownloadBtn, this.expandRightSidebarBtn);
                this.guideDownloadBtn.style.marginRight = '10px';
                console.log('✅ Guide download button added between ensemble mode and right sidebar buttons');
            } else if (header && this.themeToggle) {
                // Fallback to theme toggle position
                header.insertBefore(this.guideDownloadBtn, this.themeToggle);
                this.guideDownloadBtn.style.marginRight = '10px';
                console.log('✅ Guide download button added left of theme toggle');
            } else {
                // Final fallback positioning
                this.guideDownloadBtn.style.position = 'fixed';
                this.guideDownloadBtn.style.top = '35px';
                this.guideDownloadBtn.style.right = '330px';
                this.guideDownloadBtn.style.zIndex = '1000';
                document.body.appendChild(this.guideDownloadBtn);
                console.log('✅ Guide download button added to body');
            }
        }, 100);
        this.renderChatHistory();
        this.startNewChat();
        this.updateSelectedModelsDisplay();
        this.updateAttachmentButtonState(); // Set initial attachment button state
        
        // Check authentication state first
        console.log('🔍 Checking authentication state...');
        this.checkAuthState();
        
        this.loadFaqsFromFirebase();
    }

    // Initialize DOM elements for Prudence AI v2
    initializeElements() {
        // Core elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.newChatButton = document.getElementById('newChatButton');
        this.chatHistoryList = document.getElementById('chatHistoryList');
        
        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Model selector elements
        this.modelDropdownToggle = document.getElementById('modelDropdownToggle');
        this.modelDropdownContent = document.getElementById('modelDropdownContent');
        this.selectedModelsList = document.getElementById('selectedModelsList');
        
        // Header elements
        this.themeToggle = document.getElementById('themeToggle');
        this.compareToggle = document.getElementById('compareToggle');
        this.expandRightSidebarBtn = document.getElementById('expandRightSidebarBtn');
        
        // Guide download button
        this.guideDownloadBtn = document.createElement('button');
        this.guideDownloadBtn.innerHTML = 'Download Guide';
        this.guideDownloadBtn.className = this.themeToggle.className;
        this.guideDownloadBtn.style.marginLeft = '10px';
        this.guideDownloadBtn.style.marginRight = '10px';
        this.guideDownloadBtn.style.padding = '12px 40px';
this.guideDownloadBtn.style.fontSize = '1em';
        this.guideDownloadBtn.style.fontSize = '0.9em';
        this.guideDownloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = './assets/images/guide.html';
            link.download = 'user_guide.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        
        // Right sidebar elements
        this.rightSidebar = document.getElementById('rightSidebar');
        this.closeRightSidebarBtn = document.getElementById('closeRightSidebarBtn');
        this.individualResponses = document.getElementById('individualResponses');
        
        // Auth elements
        this.logoutBtn = document.getElementById('logoutBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.authModal = document.getElementById('authModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalEmail = document.getElementById('modalEmail');
        this.modalPassword = document.getElementById('modalPassword');
        this.modalSubmit = document.getElementById('modalSubmit');
        this.modalClose = document.getElementById('modalClose');
        this.toggleModalAuth = document.getElementById('toggleModalAuth');
        
        // Debug auth elements
        console.log('🔍 Auth elements found:');
        console.log('authModal:', !!this.authModal);
        console.log('modalTitle:', !!this.modalTitle);
        console.log('modalEmail:', !!this.modalEmail);
        console.log('modalPassword:', !!this.modalPassword);
        console.log('modalSubmit:', !!this.modalSubmit);
        console.log('modalClose:', !!this.modalClose);
        console.log('toggleModalAuth:', !!this.toggleModalAuth);
        
        // Input elements
        this.attachmentBtn = document.getElementById('attachmentBtn');
        this.optimizeBtn = document.getElementById('optimizeBtn');
        
        // Modal elements
        this.comparePopoutModal = document.getElementById('comparePopoutModal');
        this.closeComparePopout = document.getElementById('closeComparePopout');
        this.comparePopoutContentArea = document.getElementById('comparePopoutContentArea');
        
        // Template suggestions
        this.templateSuggestionsContainer = null;
        // Debug template suggestions
        console.log('🔍 Template suggestions array:', this.templateSuggestions.length, 'items');
    }

    // Initialize UI components
    initializeUI() {
        this.populateModelDropdown();
        this.initializeRightSidebar();
        this.initializeExpandRightSidebar();
    }

    // Populate model dropdown with AI models
    populateModelDropdown() {
        console.log('🔍 Populating model dropdown...');
        if (!this.modelDropdownContent) {
            console.error('❌ Model dropdown content not found');
            return;
        }
        
        this.modelDropdownContent.innerHTML = '';
        console.log('📋 Available models:', Object.keys(this.aiModels));
        
        Object.keys(this.aiModels).forEach(botId => {
            const model = this.aiModels[botId];
            const modelOption = document.createElement('div');
            modelOption.className = 'model-option';
            modelOption.dataset.modelId = botId;
            
            modelOption.innerHTML = `
                <div class="model-option-icon">
                    ${this.renderModelIcon(model.icon)}
                </div>
                <div class="model-option-info">
                    <div class="model-option-name">${model.name}</div>
                </div>
                <div class="model-option-checkbox">
                    <i class="fas fa-check"></i>
                </div>
            `;
            
            // Remove direct event listener - using event delegation instead
            this.modelDropdownContent.appendChild(modelOption);
            console.log('✅ Added model option:', model.name);
        });
        
        this.updateSelectedModelsDisplay();
        console.log('✅ Model dropdown populated successfully');
    }

    // Initialize event listeners for Prudence AI v2
    initializeEventListeners() {
        // Core chat events
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
            
            // Add input event listener to manage send button state and show template suggestions
            this.messageInput.addEventListener('input', () => {
                this.updateSendButtonState();
                this.showTemplateSuggestions();
            });
        }
        
        // Handle generated prompts from templates
        document.addEventListener('promptGenerated', (e) => {
            const { prompt, templateTitle } = e.detail;
            this.messageInput.value = prompt;
            this.updateSendButtonState();
            console.log(`Prompt generated from template: ${templateTitle}`);
        });
        if (this.newChatButton) {
            this.newChatButton.addEventListener('click', () => this.startNewChat());
        }

        // Sidebar events
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearChatHistory());
        }

        // Model selector events
        if (this.modelDropdownToggle) {
            this.modelDropdownToggle.addEventListener('click', () => this.toggleModelDropdown());
        }

        // Header events
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        if (this.compareToggle) {
            this.compareToggle.addEventListener('click', () => this.toggleCompareMode());
        }
        if (this.expandRightSidebarBtn) {
            this.expandRightSidebarBtn.addEventListener('click', () => this.openRightSidebar());
        }

        // Right sidebar events
        if (this.closeRightSidebarBtn) {
            this.closeRightSidebarBtn.addEventListener('click', () => this.closeRightSidebar());
        }

        // Auth events
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logoutUser());
        }
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.openSettings());
        }

        // Input events
        if (this.attachmentBtn) {
            this.attachmentBtn.addEventListener('click', () => this.attachFiles());
        }
        if (this.optimizeBtn) {
            this.optimizeBtn.addEventListener('click', () => this.optimizePrompt());
        }

        // Modal events
        if (this.modalSubmit) {
            console.log('🔍 Adding modal submit event listener');
            this.modalSubmit.addEventListener('click', () => {
                console.log('🔐 Modal submit button clicked');
                this.handleAuthSubmit();
            });
        } else {
            console.error('❌ Modal submit button not found');
        }
        if (this.modalClose) {
            console.log('🔍 Adding modal close event listener');
            this.modalClose.addEventListener('click', () => {
                console.log('🔐 Modal close button clicked');
                this.hideAuthModal();
            });
        } else {
            console.error('❌ Modal close button not found');
        }
        if (this.toggleModalAuth) {
            console.log('🔍 Adding modal toggle event listener');
            this.toggleModalAuth.addEventListener('click', () => {
                console.log('🔐 Modal toggle button clicked');
                this.toggleAuthMode();
            });
        } else {
            console.error('❌ Modal toggle button not found');
        }

        // Popout modal events
        if (this.closeComparePopout) {
            this.closeComparePopout.addEventListener('click', () => this.closeComparePopoutModal());
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.modelDropdownToggle?.contains(e.target) && !this.modelDropdownContent?.contains(e.target)) {
                this.closeModelDropdown();
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (this.authModal && !this.authModal.contains(e.target)) {
                this.hideAuthModal();
            }
            if (this.comparePopoutModal && !this.comparePopoutModal.contains(e.target)) {
                this.closeComparePopoutModal();
            }
        });
        
        // Add event delegation for remove buttons
        if (this.selectedModelsList) {
            this.selectedModelsList.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.remove-btn');
                if (removeBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const modelId = removeBtn.dataset.modelId;
                    console.log('Remove button clicked for model:', modelId);
                    this.toggleModelSelection(modelId);
                }
            });
        }
        
        // Add event delegation for dropdown options
        if (this.modelDropdownContent) {
            this.modelDropdownContent.addEventListener('click', (e) => {
                const modelOption = e.target.closest('.model-option');
                if (modelOption) {
                    e.preventDefault();
                    e.stopPropagation();
                    const modelId = modelOption.dataset.modelId;
                    console.log('Model option clicked:', modelId);
                    this.toggleModelSelection(modelId);
                }
            });
        }
    }

    // ===== CORE FUNCTIONALITY METHODS =====

    // Model Selection Methods
    toggleModelDropdown() {
        console.log('🔍 Toggle dropdown called');
        if (this.modelDropdownContent) {
            this.modelDropdownContent.classList.toggle('active');
            this.modelDropdownToggle?.classList.toggle('active');
            console.log('✅ Dropdown toggled, active state:', this.modelDropdownContent.classList.contains('active'));
        } else {
            console.error('❌ Model dropdown content not found');
        }
    }

    closeModelDropdown() {
        console.log('🔍 Close dropdown called');
        if (this.modelDropdownContent) {
            this.modelDropdownContent.classList.remove('active');
            this.modelDropdownToggle?.classList.remove('active');
            console.log('✅ Dropdown closed');
        }
    }

    toggleModelSelection(botId) {
        console.log('Toggle model selection called for:', botId);
        console.log('Current selected models:', this.selectedModels);
        
        const index = this.selectedModels.indexOf(botId);
        if (index > -1) {
            console.log('Removing model from selection');
            this.selectedModels.splice(index, 1);
        } else {
            console.log('Adding model to selection');
            this.selectedModels.push(botId);
        }
        
        console.log('Updated selected models:', this.selectedModels);
        
        this.updateSelectedModelsDisplay();
        this.updateModelDropdownSelection();
        this.updateAttachmentButtonState(); // Update attachment button state
    }

    updateSelectedModelsDisplay() {
        if (!this.selectedModelsList) {
            console.warn('Selected models list element not found');
            return;
        }
        
        // Clear the list first
        this.selectedModelsList.innerHTML = '';
        
        if (this.selectedModels.length === 0) {
            this.selectedModelsList.innerHTML = '<div class="no-models">No models selected</div>';
            return;
        }
        
        this.selectedModels.forEach(botId => {
            const model = this.aiModels[botId];
            if (!model) return;
            
            const tag = document.createElement('div');
            tag.className = 'selected-model-tag';
            tag.innerHTML = `
                <span>${model.name}</span>
                <button class="remove-btn" data-model-id="${botId}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            const removeBtn = tag.querySelector('.remove-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Removing model:', botId);
                this.toggleModelSelection(botId);
            });
            
            this.selectedModelsList.appendChild(tag);
        });
    }

    updateModelDropdownSelection() {
        if (!this.modelDropdownContent) return;
        
        const options = this.modelDropdownContent.querySelectorAll('.model-option');
        options.forEach(option => {
            const modelId = option.dataset.modelId;
            const isSelected = this.selectedModels.includes(modelId);
            option.classList.toggle('selected', isSelected);
        });
    }

    // Sidebar Methods
    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('collapsed');
        }
    }

    // Right Sidebar Methods
    initializeRightSidebar() {
        console.log('🔍 Initializing right sidebar resize functionality...');
        
        // Remove any existing event listeners first
        this.removeResizeEventListeners();
        
        // Initialize resize functionality with a more robust approach
        this.setupResizeFunctionality();
        
        // Load saved width on initialization
        this.loadSavedWidth();
    }
    
    removeResizeEventListeners() {
        // Remove existing event listeners if any
        const resizeHandle = document.querySelector('#resize-handle');
        if (resizeHandle) {
            const newResizeHandle = resizeHandle.cloneNode(true);
            resizeHandle.parentNode.replaceChild(newResizeHandle, resizeHandle);
        }
    }
    
    setupResizeFunctionality() {
        let isResizing = false;
        let startX, startWidth;
        
        // Test if resize handle exists and is clickable
        const resizeHandle = document.querySelector('#resize-handle');
        if (resizeHandle) {
            console.log('✅ Resize handle found:', resizeHandle);
            console.log('🔍 Resize handle styles:', {
                display: window.getComputedStyle(resizeHandle).display,
                visibility: window.getComputedStyle(resizeHandle).visibility,
                opacity: window.getComputedStyle(resizeHandle).opacity,
                cursor: window.getComputedStyle(resizeHandle).cursor,
                pointerEvents: window.getComputedStyle(resizeHandle).pointerEvents
            });
            
            // Add a simple click test
            resizeHandle.addEventListener('click', (e) => {
                console.log('✅ Resize handle clicked!');
                e.stopPropagation();
            });
        } else {
            console.error('❌ Resize handle not found!');
        }
        
        // Use event delegation for better reliability
        document.addEventListener('mousedown', (e) => {
            const resizeHandle = e.target.closest('#resize-handle');
            if (!resizeHandle) return;
            
            console.log('🖱️ Mouse down on resize handle');
            isResizing = true;
            startX = e.clientX;
            startWidth = this.rightSidebar.offsetWidth;
            
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            resizeHandle.style.transform = 'scale(1.1)';
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaX = startX - e.clientX;
            const newWidth = startWidth + deltaX;
            
            // Constrain width between 300px and 800px
            if (newWidth >= 300 && newWidth <= 800) {
                this.rightSidebar.style.width = newWidth + 'px';
                
                // Update main content margin and width
                const mainContent = document.querySelector('.main-content');
                if (mainContent && this.rightSidebar.classList.contains('open')) {
                    mainContent.style.marginRight = newWidth + 'px';
                    mainContent.style.width = `calc(100% - ${newWidth}px)`;
                    console.log('📏 Updated main content - width:', newWidth, 'marginRight:', newWidth);
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                console.log('🖱️ Mouse up, ending resize');
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                const resizeHandle = document.querySelector('#resize-handle');
                if (resizeHandle) {
                    resizeHandle.style.transform = 'scale(1)';
                }
                
                // Save the width to localStorage
                const currentWidth = this.rightSidebar.offsetWidth;
                localStorage.setItem('prudence-ai-right-sidebar-width', currentWidth);
                console.log('💾 Saved width:', currentWidth);
            }
        });
        
        // Add hover effects
        document.addEventListener('mouseenter', (e) => {
            const resizeHandle = e.target.closest('#resize-handle');
            if (resizeHandle) {
                resizeHandle.style.transform = 'scale(1.1)';
            }
        });
        
        document.addEventListener('mouseleave', (e) => {
            const resizeHandle = e.target.closest('#resize-handle');
            if (resizeHandle && !isResizing) {
                resizeHandle.style.transform = 'scale(1)';
            }
        });
        
        console.log('✅ Resize functionality setup complete');
    }
    
    loadSavedWidth() {
        const savedWidth = localStorage.getItem('prudence-ai-right-sidebar-width');
        if (savedWidth) {
            const width = parseInt(savedWidth);
            if (width >= 300 && width <= 800) {
                this.rightSidebar.style.width = width + 'px';
                
                // Update main content margin if sidebar is open
                const mainContent = document.querySelector('.main-content');
                if (mainContent && this.rightSidebar.classList.contains('open')) {
                    mainContent.style.marginRight = width + 'px';
                    mainContent.style.width = `calc(100% - ${width}px)`;
                }
                console.log('📏 Loaded saved width:', width);
            }
        }
    }

    initializeExpandRightSidebar() {
        if (this.expandRightSidebarBtn && this.rightSidebar) {
            // Show expand button only when right sidebar is closed
            if (!this.rightSidebar.classList.contains('open')) {
                this.expandRightSidebarBtn.classList.add('show');
            }
        }
    }

    openRightSidebar() {
        if (this.rightSidebar) {
            this.rightSidebar.classList.add('open');
            this.expandRightSidebarBtn?.classList.remove('show');
            
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.classList.add('with-right-sidebar');
                
                // Set initial width and adjust main content
                const savedWidth = localStorage.getItem('prudence-ai-right-sidebar-width');
                const initialWidth = savedWidth ? parseInt(savedWidth) : 400; // Default 400px
                const finalWidth = Math.max(300, Math.min(800, initialWidth));
                
                this.rightSidebar.style.width = finalWidth + 'px';
                mainContent.style.marginRight = finalWidth + 'px';
                mainContent.style.width = `calc(100% - ${finalWidth}px)`;
                
                console.log('📏 Opened sidebar with width:', finalWidth);
            }
            
            // Reinitialize resize functionality when sidebar opens
            setTimeout(() => {
                this.initializeRightSidebar();
            }, 100);
            
            // Auto-scroll to bottom when right sidebar opens
            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        }
    }

    closeRightSidebar() {
        if (this.rightSidebar) {
            this.rightSidebar.classList.remove('open');
            this.expandRightSidebarBtn?.classList.add('show');
            
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.classList.remove('with-right-sidebar');
                // Reset main content styles when sidebar closes
                mainContent.style.marginRight = '';
                mainContent.style.width = '';
            }
        }
    }

    // Theme Methods
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        localStorage.setItem('prudence-ai-theme', isDark ? 'dark' : 'light');
    }

    // Chat Methods
    startNewChat() {
        // Save current chat before starting new one
        if (this.messages && this.messages.length > 0) {
            this.saveChatHistory();
        }
        
        this.currentChatId = 'chat_' + Date.now();
        this.messages = [];
        
        // Expand left sidebar when starting new chat (Prudence AI v2 behavior)
        if (this.sidebar && this.sidebar.classList.contains('collapsed')) {
            this.sidebar.classList.remove('collapsed');
        }
        
        if (this.chatMessages) {
            this.chatMessages.innerHTML = `
                <div class="message ai-message" data-welcome="true">
                    <div class="message-content">
                        <strong>🤖 AADI CLOUD:</strong>
                        <div>Welcome to AADI CLOUD</div>
                        <div>Start a conversation with your AI assistant. Select different models or use ensemble mode to see responses from multiple AIs.</div>
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            `;
        }
        
        if (this.individualResponses) {
            this.individualResponses.innerHTML = '';
        }
        
        if (this.messageInput) {
            this.messageInput.focus();
        }
        
        this.compareMode = true;
        if (this.compareToggle) {
            this.compareToggle.classList.add('active');
        }
        
        // Auto-scroll to welcome message
        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        const hasAttachments = this.attachments && this.attachments.length > 0;
        
        console.log('🔍 sendMessage debug:', {
            message: message,
            hasAttachments: hasAttachments,
            attachments: this.attachments,
            attachmentCount: this.attachments ? this.attachments.length : 0
        });
        
        // Hide template suggestions when sending a message
        this.hideTemplateSuggestions();
        
        if (!message && !hasAttachments) return;

        if (!this.selectedModels || this.selectedModels.length === 0) {
            this.addMessage("Please select an AI model before sending a message.", 'ai');
            this.messageInput.value = '';
            this.clearAttachments();
            return;
        }

        const welcomeMessage = this.chatMessages.querySelector('[data-welcome="true"]');
        if (welcomeMessage) welcomeMessage.remove();

        // Create message content with attachments for display
        let messageContent = message;
        if (hasAttachments) {
            const attachmentInfo = this.attachments.map(file => 
                `📎 ${file.name} (${this.formatFileSize(file.size)})`
            ).join('\n');
            messageContent = message ? `${message}\n\n${attachmentInfo}` : attachmentInfo;
        }

        this.messages.push({
            content: messageContent,
            sender: 'user',
            timestamp: Date.now(),
            attachments: this.attachments ? [...this.attachments] : []
        });

        this.messageInput.value = '';
        this.sendButton.disabled = true;

        // Auto-scroll immediately when user sends message
        this.scrollToBottom();
        
        // Save chat history after adding user message
        this.saveChatHistory();
        
        console.log('🔍 About to call handleCompareMode with message:', message);
        console.log('🔍 Attachments before handleCompareMode:', this.attachments);
        
        // Pass the original message (not messageContent) to handleCompareMode
        // so that file content can be processed properly in generateAIResponse
        this.handleCompareMode(message);
        
        // Clear attachments after processing
        this.clearAttachments();
    }

    // ===== AI RESPONSE HANDLING =====

    async handleCompareMode(message) {
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Collapse left sidebar when conversation starts (Prudence AI v2 behavior)
        if (this.sidebar && !this.sidebar.classList.contains('collapsed')) {
            this.sidebar.classList.add('collapsed');
        }
        
        // Open right sidebar to show individual responses
        this.openRightSidebar();
        
        // Store attachments for processing (they might be cleared during the process)
        const currentAttachments = this.attachments ? [...this.attachments] : [];
        console.log('🔍 Stored attachments for processing:', currentAttachments.map(f => f.name));
        
        // Generate responses from all selected models
        const botResponses = [];
        const responsePromises = this.selectedModels.map(async (botId, index) => {
            const responseDiv = this.createIndividualResponseDiv(botId, index);
            this.individualResponses.appendChild(responseDiv);
            
            // Show typing indicator
            let typingMessage = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            
            // Add special indicator for Gemini models with supported files
            const geminiModelKeys = ['gemini-2.5-flash', 'gemini-2.0-flash'];
            if (geminiModelKeys.includes(botId) && currentAttachments.length > 0) {
                const supportedFiles = currentAttachments.filter(file => {
                    const fileName = file.name.toLowerCase();
                    return fileName.endsWith('.txt') || 
                           fileName.endsWith('.pdf') || 
                           fileName.endsWith('.jpg') || 
                           fileName.endsWith('.jpeg') || 
                           fileName.endsWith('.png') || 
                           fileName.endsWith('.gif') || 
                           fileName.endsWith('.webp');
                });
                
                if (supportedFiles.length > 0) {
                    typingMessage = `
                        <div class="typing-indicator">
                            <div style="margin-bottom: 8px; color: #4CAF50; font-size: 12px;">
                                📄 Reading ${supportedFiles.length} text file(s)...
                            </div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    `;
                }
            }
            
            responseDiv.querySelector('.response-content').innerHTML = typingMessage;
            
            // Auto-scroll when typing indicator appears
            this.scrollToBottom();
            
            // Generate response
            setTimeout(async () => {
                // Temporarily restore attachments for this response generation
                const originalAttachments = this.attachments;
                this.attachments = currentAttachments;
                
                const response = await this.generateAIResponse(message, botId);
                botResponses[index] = response;
                
                // Restore original attachments
                this.attachments = originalAttachments;
                
                // Update response content
                responseDiv.querySelector('.response-content').innerHTML = this.formatAnswer(response);
                
                // Highlight code blocks
                if (window.hljs) {
                    responseDiv.querySelectorAll('pre code').forEach(block => {
                        window.hljs.highlightElement(block);
                    });
                }
                
                // Add to messages array
                this.messages.push({
                    content: response,
                    sender: 'ai',
                    botId: botId,
                    timestamp: Date.now()
                });
                
                // Save chat history after each AI response
                this.saveChatHistory();
                
                // Check if all responses are complete
                if (botResponses.filter(r => r).length === this.selectedModels.length) {
                    this.sendButton.disabled = false;
                    this.saveChatHistory();
                    
                    // Create ensemble button using FusionService
                    this.fusionService.createEnsembleButton(
                        this.chatMessages, // grid container
                        message,
                        botResponses,
                        this.selectedModels,
                        this.aiModels,
                        this.chatMessages, // compare container
                        this.formatAnswer.bind(this),
                        this.messages,
                        this.saveChatHistory.bind(this)
                    );
                    
                    // Auto-scroll after ensemble button is created
                    setTimeout(() => {
                        this.scrollToBottom();
                    }, 100);
                }
                
                // Scroll to bottom
                this.scrollToBottom();
            }, Math.random() * 2000 + 1000 + (index * 500));
        });
        
        await Promise.all(responsePromises);
    }

    createIndividualResponseDiv(botId, index) {
        const model = this.aiModels[botId];
        const responseDiv = document.createElement('div');
        responseDiv.className = 'individual-response';
        responseDiv.dataset.botId = botId;
        
        responseDiv.innerHTML = `
            <div class="response-header">
                <div class="response-icon">${this.renderModelIcon(model.icon)}</div>
                <div class="response-name">${model.name}</div>
            </div>
            <div class="response-content"></div>
            <div class="response-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        
        return responseDiv;
    }

    async generateFusedResponse(userMessage, botResponses) {
        try {
            console.log('🔍 Starting fusion process with FusionService...');
            
            // Use the FusionService to generate the fused response
            await this.fusionService.generateFusedResponse(
                userMessage, 
                botResponses, 
                this.selectedModels, 
                this.aiModels, 
                this.chatMessages, // Use chatMessages as the grid container
                this.chatMessages, // Use chatMessages as the compare container
                this.formatAnswer.bind(this), // Bind the formatAnswer method
                this.messages, // Pass the messages array
                this.saveChatHistory.bind(this) // Bind the saveChatHistory method
            );
            
            console.log('✅ Fusion completed successfully');
            
        } catch (error) {
            console.error('❌ Error in generateFusedResponse:', error);
            
            // Fallback: show concatenated responses in main chat
            const fallbackText = botResponses.map((response, index) => {
                const modelName = this.aiModels[this.selectedModels[index]]?.name || `AI Model ${index + 1}`;
                return `**${modelName}:**\n${response}`;
            }).join('\n\n---\n\n');
            
            this.addMessage(fallbackText, 'ai', 'fused-fallback');
            this.saveChatHistory();
        }
    }

    // ===== UTILITY METHODS =====

    addMessage(content, sender, botId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">${this.escapeHtml(content)}</div>
                <div class="message-time">${currentTime}</div>
            `;
        } else {
            const botName = botId ? this.aiModels[botId]?.name || 'AI Assistant' : 'AI Assistant';
            const botIcon = botId ? this.aiModels[botId]?.icon || '🤖' : '🤖';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <strong>${botIcon} ${botName}:</strong>
                    <div>${this.formatAnswer(content)}</div>
                </div>
                <div class="message-time">${currentTime}</div>
            `;
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatAnswer(text) {
    // If marked.js is available, use it for full Markdown parsing
    if (typeof marked !== 'undefined') {
        return `<div class="formatted-response">${marked.parse(text)}</div>`;
    }

    // Fallback if marked.js is not available
    let formattedText = text;

    // Headings
    formattedText = formattedText
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold, Italic, Strikethrough
    formattedText = formattedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Inline Code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Blockquotes
    formattedText = formattedText.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Code blocks
    formattedText = formattedText.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'text';
        return `<pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>`;
    });

    // Lists (Unordered)
    formattedText = formattedText.replace(/(?:^|\n)(\s*)[*+-] (.*)/g, (match, spaces, content) => {
        return `<ul><li>${content}</li></ul>`;
    });
    // Lists (Ordered)
    formattedText = formattedText.replace(/(?:^|\n)(\s*)(\d+)\. (.*)/g, (match, spaces, number, content) => {
        return `<ol><li>${content}</li></ol>`;
    });

    // Merge consecutive list tags
    formattedText = formattedText
        .replace(/<\/ul>\s*<ul>/g, '') // merge <ul>
        .replace(/<\/ol>\s*<ol>/g, ''); // merge <ol>

    // Paragraphs and line breaks
    formattedText = formattedText
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrap if no outer element
    if (!formattedText.startsWith('<') && !formattedText.endsWith('>')) {
        formattedText = `<p>${formattedText}</p>`;
    }

    return `<div class="formatted-response">${formattedText}</div>`;
}


    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        // Scroll main chat area
        setTimeout(() => {
            if (this.chatMessages) {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        }, 50);
        
        // Scroll individual responses area
        setTimeout(() => {
            if (this.individualResponses) {
                this.individualResponses.scrollTop = this.individualResponses.scrollHeight;
            }
        }, 100);
        
        // Additional scroll after content is fully rendered
        setTimeout(() => {
            if (this.chatMessages) {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
            if (this.individualResponses) {
                this.individualResponses.scrollTop = this.individualResponses.scrollHeight;
            }
        }, 300);
    }

    renderModelIcon(icon) {
        if (typeof icon === 'string' && (icon.endsWith('.svg') || icon.endsWith('.png'))) {
            return `<img src='${icon}' class='model-svg-icon' style='width:24px;height:24px;vertical-align:middle;' alt='AI Model Icon' />`;
        } else if (typeof icon === 'string' && icon.includes('<svg')) {
            // Handle inline SVG icons - ensure unique gradient IDs
            const uniqueId = 'icon-' + Math.random().toString(36).substr(2, 9);
            return icon.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`)
                      .replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);
        } else {
            return icon;
        }
    }

    // ===== AUTHENTICATION METHODS =====

    checkAuthState() {
        console.log('🔍 Starting auth state check...');
        checkAuthState((user) => {
            console.log('🔍 Auth state callback received:', user ? 'User logged in' : 'No user');
            if (user) {
                console.log('✅ User is authenticated:', user.email);
                console.log('🔍 About to load chat history from Firebase for user:', user.uid);
                this.loadChatHistoryFromFirebase(user.uid);
                this.showChatArea();
            } else {
                console.log('❌ No user authenticated, loading from localStorage');
                this.showChatArea(); // Show chat area even when not authenticated
                this.loadFromLocalStorage(); // Load from localStorage when not authenticated
            }
        });
    }

    showAuthModal(isLogin = true) {
        console.log('🔐 Showing auth modal:', isLogin ? 'Login' : 'Sign Up');
        
        // Remove any existing modal
        const existingModal = document.querySelector('.dynamic-auth-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal dynamically
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'dynamic-auth-modal';
        modalOverlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.7) !important;
            z-index: 9999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            backdrop-filter: blur(5px) !important;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white !important;
            padding: 30px !important;
            border-radius: 12px !important;
            width: 90% !important;
            max-width: 400px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            position: relative !important;
        `;
        
        modalContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">${isLogin ? 'Login' : 'Sign Up'}</h2>
            <input type="email" id="dynamicEmail" placeholder="Email" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
            <input type="password" id="dynamicPassword" placeholder="Password" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
            <button id="dynamicSubmit" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin: 10px 0;">${isLogin ? 'Login' : 'Sign Up'}</button>
            <button id="dynamicClose" style="width: 100%; padding: 12px; background: #ccc; color: black; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin: 10px 0;">Close</button>
            <div id="dynamicToggle" style="margin-top: 15px; color: #667eea; cursor: pointer; text-align: center; font-size: 14px;">${isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}</div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        const submitBtn = document.getElementById('dynamicSubmit');
        const closeBtn = document.getElementById('dynamicClose');
        const toggleBtn = document.getElementById('dynamicToggle');
        const emailInput = document.getElementById('dynamicEmail');
        const passwordInput = document.getElementById('dynamicPassword');
        
        submitBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!email || !password) {
                alert("Email and password are required");
                return;
            }
            
            if (isLogin) {
                this.loginUser(email, password);
            } else {
                this.signUpUser(email, password);
            }
            
            modalOverlay.remove();
        });
        
        closeBtn.addEventListener('click', () => {
            modalOverlay.remove();
        });
        
        toggleBtn.addEventListener('click', () => {
            modalOverlay.remove();
            this.showAuthModal(!isLogin);
        });
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
        
        // Focus on email input
        emailInput.focus();
        
        console.log('✅ Dynamic auth modal created and displayed');
    }

    hideAuthModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
            this.modalEmail.value = '';
            this.modalPassword.value = '';
        }
    }

    handleAuthSubmit() {
        console.log('🔐 Auth submit button clicked');
        const email = this.modalEmail.value.trim();
        const password = this.modalPassword.value.trim();
        
        console.log('🔍 Form values:', { email: email ? 'provided' : 'empty', password: password ? 'provided' : 'empty' });
        
        if (!email || !password) {
            alert("Email and password are required");
            return;
        }
        
        const isLogin = this.modalTitle.textContent === 'Login';
        console.log('🔍 Auth mode:', isLogin ? 'Login' : 'Sign Up');
        
        if (isLogin) {
            this.loginUser(email, password);
        } else {
            this.signUpUser(email, password);
        }
    }

    toggleAuthMode() {
        console.log('🔐 Toggling auth mode');
        const isLogin = this.modalTitle.textContent === 'Login';
        console.log('🔍 Current mode:', isLogin ? 'Login' : 'Sign Up');
        this.showAuthModal(!isLogin);
    }

    loginUser(email, password) {
        console.log('🔐 Attempting login for:', email);
        loginUser(email, password,
            (userCredential) => {
                console.log("✅ User signed in with UID:", userCredential.user.uid);
                this.addMessage(`Welcome ${email.split('@')[0]}! You have successfully logged in.`, 'ai');
                this.hideAuthModal();
                
                // Load chat history from Firebase after successful login
                this.loadChatHistoryFromFirebase(userCredential.user.uid);
                this.showChatArea();
            },
            (error) => {
                console.error("❌ Error signing in:", error.code, error.message);
                alert(`Error: ${error.message}`);
            }
        );
    }

    signUpUser(email, password) {
        console.log('🔐 Attempting signup for:', email);
        signUpUser(email, password,
            (userCredential) => {
                const userId = userCredential.user.uid;
                console.log("✅ User signed up with UID:", userId);
                set(ref(this.database, 'users/' + userId), { email: email })
                    .then(() => {
                        console.log("✅ User data saved to Firebase");
                        this.addMessage(`Welcome ${email.split('@')[0]}! You have successfully signed up.`, 'ai');
                        this.hideAuthModal();
                        
                        // Load chat history from Firebase after successful signup
                        this.loadChatHistoryFromFirebase(userId);
                        this.showChatArea();
                    })
                    .catch((error) => {
                        console.error("❌ Error saving data:", error.message);
                        alert(`Error: ${error.message}`);
                    });
            },
            (error) => {
                console.error("❌ Error signing up:", error.code, error.message);
                alert(`Error: ${error.message}`);
            }
        );
    }

    logoutUser() {
        logoutUser(
            () => {
                console.log("User signed out");
                
                // Clear current chat data
                this.messages = [];
                this.chatHistory = [];
                this.currentChatId = null;
                
                // Clear localStorage
                localStorage.removeItem('prudence-ai-chats');
                
                // Show login screen
                this.hideChatArea();
            },
            (error) => {
                console.error("Error signing out:", error.message);
                alert(`Error: ${error.message}`);
            }
        );
    }

    showChatArea() {
        this.chatMessages.style.display = 'block';
        this.messageInput.style.display = 'inline';
        this.sendButton.style.display = 'flex';
        
        // Show logout button when user is logged in
        if (this.logoutBtn) {
            this.logoutBtn.style.display = 'block';
        }
        
        if (!this.currentChatId || this.messages.length === 0) {
            this.startNewChat();
        }
    }

    hideChatArea() {
        this.chatMessages.style.display = 'block';
        this.messageInput.style.display = 'none';
        this.sendButton.style.display = 'none';
        
        // Hide logout button when user is logged out
        if (this.logoutBtn) {
            this.logoutBtn.style.display = 'none';
        }
        
        this.chatMessages.innerHTML = `
            <div class="login-message">
                <div class="login-message-content">
                    <h2>🔐 Welcome to AADI CLOUD</h2>
                    <p>Please login or signup to start chatting with our AI models.</p>
                    <div class="login-actions">
                        <button class="login-action-btn" id="loginBtn">Login</button>
                        <button class="login-action-btn" id="signupBtn">Sign Up</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to the buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showAuthModal(true);
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.showAuthModal(false);
            });
        }
    }

    // ===== FIREBASE METHODS =====

    loadChatHistoryFromFirebase(userId) {
        console.log('📥 Loading chat history from Firebase for user:', userId);
        
        get(ref(this.database, `users/${userId}/chatHistory`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    this.chatHistory = snapshot.val();
                    console.log('✅ Chat history loaded from Firebase:', this.chatHistory.length, 'chats');
                    
                    // Add a small delay to ensure DOM elements are ready
                    setTimeout(() => {
                    this.renderChatHistory();
                    }, 100);
                } else {
                    console.log('📭 No chat history found in Firebase, starting fresh');
                    this.chatHistory = [];
                    setTimeout(() => {
                        this.renderChatHistory();
                    }, 100);
                }
            })
            .catch((error) => {
                console.error("❌ Error loading chat history from Firebase:", error);
                // Try to load from localStorage as fallback
                console.log('🔄 Falling back to localStorage...');
                this.loadFromLocalStorage();
            });
    }

    loadFromLocalStorage() {
        try {
            const savedChats = localStorage.getItem('prudence-ai-chats');
            if (savedChats) {
                this.chatHistory = JSON.parse(savedChats);
                console.log("Chat history loaded from localStorage");
            } else {
                this.chatHistory = [];
            }
            
            // Add a small delay to ensure DOM elements are ready
            setTimeout(() => {
            this.renderChatHistory();
            }, 100);
        } catch (error) {
            console.error("Error loading chat history from localStorage:", error);
            this.chatHistory = [];
            setTimeout(() => {
            this.renderChatHistory();
            }, 100);
        }
    }

    saveChatHistory() {
        const user = this.auth.currentUser;
        console.log('💾 Saving chat history...', {
            user: user ? user.email : 'Not authenticated',
            messagesCount: this.messages.length,
            currentChatId: this.currentChatId,
            chatHistoryLength: this.chatHistory.length
        });
        
        if (this.messages.length > 0) {
            const existingChatIndex = this.chatHistory.findIndex(chat => chat.id === this.currentChatId);
            const chatData = {
                id: this.currentChatId,
                title: this.messages[0].content.substring(0, 30) + (this.messages[0].content.length > 30 ? '...' : ''),
                messages: this.messages,
                lastUpdated: Date.now()
            };

            if (existingChatIndex !== -1) {
                this.chatHistory[existingChatIndex] = chatData;
                console.log('📝 Updated existing chat at index:', existingChatIndex);
            } else {
                this.chatHistory.unshift(chatData);
                console.log('➕ Added new chat to history');
            }

            this.chatHistory = this.chatHistory.slice(0, 20);

            // Save to Firebase if user is authenticated
            if (user) {
                set(ref(this.database, `users/${user.uid}/chatHistory`), this.chatHistory)
                    .then(() => {
                        console.log("✅ Chat history saved to Firebase");
                    })
                    .catch((error) => {
                        console.error("❌ Error saving chat history to Firebase:", error);
                        // Fallback to localStorage if Firebase fails
                        this.saveToLocalStorage();
                    });
            } else {
                // Save to localStorage if user is not authenticated
                this.saveToLocalStorage();
            }

            this.renderChatHistory();
        } else {
            console.log('⚠️ No messages to save');
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('prudence-ai-chats', JSON.stringify(this.chatHistory));
            console.log("Chat history saved to localStorage");
        } catch (error) {
            console.error("Error saving chat history to localStorage:", error);
        }
    }

    renderChatHistory() {
        console.log('🎨 Rendering chat history...', {
            chatHistoryList: !!this.chatHistoryList,
            chatHistoryLength: this.chatHistory.length,
            currentChatId: this.currentChatId,
            chatHistory: this.chatHistory
        });
        
        if (!this.chatHistoryList) {
            console.log('❌ Chat history list element not found');
            console.log('🔍 Available elements:', {
                chatMessages: !!this.chatMessages,
                messageInput: !!this.messageInput,
                sendButton: !!this.sendButton,
                newChatButton: !!this.newChatButton
            });
            return;
        }
        
        console.log('✅ Chat history list element found, clearing and rendering...');
        this.chatHistoryList.innerHTML = '';
        
        if (this.chatHistory.length === 0) {
            console.log('📭 No chat history to render');
            return;
        }
        
        this.chatHistory.forEach((chat, index) => {
            console.log(`📋 Rendering chat ${index}:`, {
                id: chat.id,
                title: chat.title,
                messagesCount: chat.messages.length,
                isActive: chat.id === this.currentChatId
            });
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            
            if (chat.id === this.currentChatId) {
                chatItem.classList.add('active');
            }

            const lastMessage = chat.messages[chat.messages.length - 1];
            const preview = lastMessage ? lastMessage.content.substring(0, 50) + '...' : '';

            chatItem.innerHTML = `
                <div class="chat-title">${chat.title}</div>
                <div class="chat-preview">${preview}</div>
            `;

            chatItem.addEventListener('click', () => this.loadChat(chat));
            this.chatHistoryList.appendChild(chatItem);
        });
        
        console.log(`✅ Rendered ${this.chatHistory.length} chat items`);
    }

    loadChat(chat) {
        this.currentChatId = chat.id;
        this.messages = [...chat.messages];
        
        this.chatMessages.innerHTML = '';
        this.messages.forEach(message => {
            this.addMessage(message.content, message.sender, message.botId);
        });
        
        this.renderChatHistory();
        this.scrollToBottom();
    }

    clearChatHistory() {
        if (confirm('Are you sure you want to clear all chat history?')) {
            this.chatHistory = [];
            this.renderChatHistory();
            
            const user = this.auth.currentUser;
            if (user) {
                set(ref(this.database, `users/${user.uid}/chatHistory`), [])
                    .then(() => console.log("Chat history cleared from Firebase"))
                    .catch((error) => console.error("Error clearing chat history:", error));
            } else {
                // Clear from localStorage if user is not authenticated
                localStorage.removeItem('prudence-ai-chats');
                console.log("Chat history cleared from localStorage");
            }
        }
    }

    // ===== AI RESPONSE GENERATION =====

    async generateAIResponse(userMessage, botId) {
        console.log('🔍 generateAIResponse called:', {
            userMessage: userMessage,
            botId: botId,
            attachments: this.attachments,
            attachmentCount: this.attachments ? this.attachments.length : 0
        });
        
        const model = this.aiModels[botId];
        const lowerMessage = userMessage.toLowerCase();

        // Check for FAQ answer first
        const faqAnswer = this.getFaqAnswer(userMessage);
        if (faqAnswer) return faqAnswer;

        // Handle Cerebras API calls
        const cerebrasModelKeys = [
            'llama3-8b', 'llama3-70b', 'llama4-scout-17b-16e-instruct',
            'llama4-maverick-17b-128e-instruct', 'qwen-3-32b', 'qwen-3-235b-a22b'
        ];
        
        if (cerebrasModelKeys.includes(botId)) {
            try {
                const maxTokens = (botId.includes('qwen')) ? 12000 : 1000;
                const cerebrasResult = await cerebrasAPI.generateResponse(userMessage, {
                    maxTokens: maxTokens,
                    temperature: this.modelTemperatures[botId] || 0.7,
                    model: botId
                });
                
                if (cerebrasResult.success) {
                    let responseText = cerebrasResult.text;
                    if (botId.includes('qwen')) {
                        responseText = this.filterQwenResponse(responseText);
                    }
                    return responseText;
                } else {
                    return `Sorry, I couldn't get a response from Cerebras: ${cerebrasResult.error}`;
                }
            } catch (error) {
                console.error('Error calling Cerebras API:', error);
                return `Sorry, there was an error connecting to Cerebras: ${error.message}`;
            }
        }

        // Handle Gemini API calls
        const geminiModelKeys = ['gemini-2.5-flash', 'gemini-2.0-flash'];
        if (geminiModelKeys.includes(botId)) {
            console.log('🔍 Processing Gemini model:', botId);
            console.log('🔍 Checking for supported files in attachments...');
            
            try {
                // Check if there are supported file attachments for Gemini models
                let enhancedMessage = userMessage;
                if (this.attachments && this.attachments.length > 0) {
                    console.log('🔍 Found attachments:', this.attachments.map(f => f.name));
                    
                    // Filter for supported file types
                    const supportedFiles = this.attachments.filter(file => {
                        const fileName = file.name.toLowerCase();
                        return fileName.endsWith('.txt');
                    });
                    
                    console.log('🔍 Supported files found:', supportedFiles.map(f => f.name));
                    
                    if (supportedFiles.length > 0) {
                        console.log(`🤖 Gemini model ${botId} will process ${supportedFiles.length} text file(s)`);
                        const fileContents = await templateModule.processTextFiles(supportedFiles);
                        enhancedMessage = `${userMessage}\n\n📎 Attached Text Files:\n${fileContents}`;
                        console.log(`📤 Sending enhanced message to Gemini (${botId}) with file content`);
                        console.log('🔍 Enhanced message preview:', enhancedMessage.substring(0, 200) + '...');
                    } else {
                        console.log('🔍 No supported files found in attachments');
                    }
                } else {
                    console.log('🔍 No attachments found');
                }

                // Try the requested model first
                let geminiResult;
                try {
                    geminiResult = await geminiAPI.generateResponse(enhancedMessage, {
                    model: botId,
                    temperature: this.modelTemperatures[botId] || 0.7,
                        maxTokens: botId === 'gemini-2.5-flash' ? 4000 : 1000
                    });
                } catch (firstError) {
                    // If the first model fails due to rate limits, try the other Gemini model
                    if (firstError.message.includes('Rate limit exceeded') || firstError.message.includes('Quota exceeded')) {
                        console.log(`⚠️ ${botId} failed due to rate limits, trying alternative Gemini model...`);
                        
                        const alternativeModel = botId === 'gemini-2.5-flash' ? 'gemini-2.0-flash' : 'gemini-2.5-flash';
                        console.log(`🔄 Retrying with ${alternativeModel}...`);
                        
                        try {
                            geminiResult = await geminiAPI.generateResponse(enhancedMessage, {
                                model: alternativeModel,
                                temperature: this.modelTemperatures[alternativeModel] || 0.7,
                                maxTokens: alternativeModel === 'gemini-2.5-flash' ? 4000 : 1000
                            });
                            console.log(`✅ Successfully used ${alternativeModel} as fallback`);
                        } catch (secondError) {
                            // Both models failed, throw the original error
                            throw firstError;
                        }
                } else {
                        // Not a rate limit error, throw the original error
                        throw firstError;
                    }
                }

                console.log('🔍 Gemini API response received:', geminiResult);
                
                if (geminiResult && geminiResult.text && geminiResult.text.trim() !== '') {
                    console.log('✅ Gemini response text extracted successfully');
                    return geminiResult.text;
                } else {
                    console.error('❌ Empty or invalid response from Gemini API');
                    throw new Error('Empty response from Gemini API');
                }

            } catch (error) {
                console.error('❌ Gemini API error:', error.message);
                
                // Handle specific error types with helpful messages
                if (error.message.includes('Rate limit exceeded') || error.message.includes('Quota exceeded')) {
                    const fallbackMessage = `⚠️ **All Gemini models are currently unavailable** due to rate limits or quota restrictions.

**What happened:**
- Both Gemini 2.0 Flash and Gemini 2.5 Flash have hit their usage limits
- This is a temporary issue that will resolve automatically

**Solutions:**
1. **Wait a few minutes** and try again
2. **Use a different AI model** (Cerebras, Qwen, etc.)
3. **Check your API quota** at https://ai.google.dev/gemini-api/docs/rate-limits

**For file analysis:**
- Text files: Try copying and pasting the content directly
- Images: Try describing the image in your message
- PDFs: Try copying and pasting the text content

The system will automatically retry when the quota resets.`;
                    
                    return fallbackMessage;
                } else if (error.message.includes('Invalid request')) {
                    return `❌ **${botId} encountered an error** processing your request.

**Error:** ${error.message}

**Please try:**
- Simplifying your message
- Using a different model
- Checking your file format`;
                } else {
                    return `❌ **${botId} is temporarily unavailable.**

**Error:** ${error.message}

**Please try again in a moment or use a different model.**`;
                }
            }
        }

        // Fallback responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return `Hello! I'm ${model.name}, your AI assistant. ${model.description}. How can I help you today?`;
        } else if (lowerMessage.includes('how are you')) {
            return `I'm doing great, thank you for asking! As ${model.name}, I'm here and ready to assist you.`;
        } else if (lowerMessage.includes('what can you do')) {
            return `As ${model.name}, I can help you with a wide variety of tasks. ${model.description}. What would you like to explore?`;
        } else {
            const responses = model.responses || ['I\'m here to help!', 'How can I assist you today?'];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    filterQwenResponse(responseText) {
        let filteredText = responseText;
        filteredText = filteredText.replace(/<think>.*?<\/think>/gs, '');
        filteredText = filteredText.replace(/Let me think about this.*?\./gs, '');
        filteredText = filteredText.replace(/Let me analyze.*?\./gs, '');
        filteredText = filteredText.replace(/First, I need to.*?\./gs, '');
        filteredText = filteredText.replace(/I should.*?\./gs, '');
        filteredText = filteredText.replace(/Okay, so.*?\./gs, '');
        filteredText = filteredText.replace(/\n\s*\n\s*\n/g, '\n\n');
        filteredText = filteredText.trim();
        
        if (!filteredText || filteredText.length < 10) {
            return responseText;
        }
        
        return filteredText;
    }



    // Helper method to read file as text
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // ===== FAQ METHODS =====

    loadFaqsFromFirebase() {
        loadFaqsFromFirebase(
            (faqs) => { this.faqs = faqs; },
            (personalityFaqs) => { this.personalityFaqs = personalityFaqs; }
        );
    }

    getFaqAnswer(message) {
        return getFaqAnswer(message, this.faqs, this.personalityFaqs);
    }

    // ===== UTILITY METHODS =====

    toggleCompareMode() {
        this.compareMode = true;
        if (this.compareToggle) {
            this.compareToggle.classList.add('active');
        }
    }

    attachFiles() {
        // Check if attachment is enabled (only for Gemini models)
        const attachmentButton = document.querySelector('.attachment-btn');
        if (attachmentButton && attachmentButton.disabled) {
            alert('File attachments are only available when Gemini models are selected.');
            return;
        }
        
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '.txt';
        
        fileInput.addEventListener('change', (event) => {
            const files = Array.from(event.target.files);
            
            if (files.length === 0) return;
            
            // Filter for .txt files only
            const txtFiles = files.filter(file => {
                const fileName = file.name.toLowerCase();
                if (!fileName.endsWith('.txt')) {
                    alert(`File "${file.name}" is not supported. Only .txt files are allowed.`);
                    return false;
                }
                return true;
            });
            
            // Validate file sizes (max 10MB per file)
            const maxSize = 10 * 1024 * 1024; // 10MB
            const validFiles = txtFiles.filter(file => {
                if (file.size > maxSize) {
                    alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                    return false;
                }
                return true;
            });
            
            if (validFiles.length === 0) return;
            
            // Create attachment preview
            this.createAttachmentPreview(validFiles);
            
            // Add files to message input
            this.addFilesToMessage(validFiles);
        });
        
        fileInput.click();
    }

    createAttachmentPreview(files) {
        // Remove existing attachment preview
        const existingPreview = document.querySelector('.attachment-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Create attachment preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'attachment-preview';
        previewContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            max-width: 300px;
            max-height: 400px;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        `;
        
        header.innerHTML = `
            <span style="font-weight: 600; color: #333;">📎 Attachments (${files.length})</span>
            <button class="close-attachments" style="
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
        `;
        
        previewContainer.appendChild(header);
        
        // Add file previews
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                border-radius: 4px;
                background: #f8f9fa;
                margin-bottom: 8px;
            `;
            
            const fileIcon = this.getFileIcon(file.type);
            const fileSize = this.formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <span style="font-size: 20px;">${fileIcon}</span>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 12px; font-weight: 500; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</div>
                    <div style="font-size: 10px; color: #666;">${fileSize}</div>
                </div>
                <button class="remove-file" data-index="${index}" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            `;
            
            previewContainer.appendChild(fileItem);
        });
        
        document.body.appendChild(previewContainer);
        
        // Add event listeners
        previewContainer.querySelector('.close-attachments').addEventListener('click', () => {
            previewContainer.remove();
            this.clearAttachments();
        });
        
        previewContainer.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeAttachment(index);
                previewContainer.remove();
                this.createAttachmentPreview(this.attachments || []);
            });
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (previewContainer.parentNode) {
                previewContainer.remove();
            }
        }, 10000);
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
        return '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    addFilesToMessage(files) {
        this.attachments = files;
        
        // Add file info to message input
        const fileInfo = files.map(file => `📎 ${file.name} (${this.formatFileSize(file.size)})`).join('\n');
        
        if (this.messageInput.value.trim()) {
            this.messageInput.value += '\n\n' + fileInfo;
        } else {
            this.messageInput.value = fileInfo;
        }
        
        // Update send button state
        this.updateSendButtonState();
    }

    removeAttachment(index) {
        if (this.attachments && this.attachments[index]) {
            this.attachments.splice(index, 1);
            this.updateSendButtonState();
        }
    }

    clearAttachments() {
        this.attachments = [];
        this.updateSendButtonState();
    }

    updateSendButtonState() {
        if (this.sendButton) {
            const hasText = this.messageInput.value.trim().length > 0;
            const hasAttachments = this.attachments && this.attachments.length > 0;
            this.sendButton.disabled = !(hasText || hasAttachments);
        }
    }

    optimizePrompt() {
        const currentPrompt = this.messageInput.value.trim();
        
        if (!currentPrompt) {
            alert('Please enter a prompt to optimize.');
            return;
        }
        
        // Create prompt optimizer modal
        this.createPromptOptimizerModal(currentPrompt);
    }

    createPromptOptimizerModal(originalPrompt) {
        // Remove existing modal
        const existingModal = document.querySelector('.prompt-optimizer-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'prompt-optimizer-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'prompt-optimizer-modal';
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 600px;
            width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333; font-size: 20px;">🎯 Prompt Optimizer</h3>
                <button class="close-optimizer" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Original Prompt:</label>
                <textarea id="original-prompt" readonly style="
                    width: 100%;
                    min-height: 80px;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 14px;
                    resize: vertical;
                    background: #f8f9fa;
                ">${originalPrompt}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Optimization Style:</label>
                <select id="optimization-style" style="
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                ">
                    <option value="professional">Professional & Formal</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="detailed">Detailed & Comprehensive</option>
                    <option value="concise">Concise & Direct</option>
                    <option value="creative">Creative & Engaging</option>
                    <option value="technical">Technical & Precise</option>
                    <option value="educational">Educational & Explanatory</option>
                    <option value="conversational">Conversational & Natural</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Optimized Prompt:</label>
                <textarea id="optimized-prompt" style="
                    width: 100%;
                    min-height: 120px;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 14px;
                    resize: vertical;
                "></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="cancel-optimizer" style="
                    padding: 10px 20px;
                    border: 2px solid #ddd;
                    background: white;
                    color: #666;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                ">Cancel</button>
                <button class="apply-optimized" style="
                    padding: 10px 20px;
                    border: none;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                ">Apply Optimized Prompt</button>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Get elements
        const styleSelect = modalContent.querySelector('#optimization-style');
        const optimizedTextarea = modalContent.querySelector('#optimized-prompt');
        const closeBtn = modalContent.querySelector('.close-optimizer');
        const cancelBtn = modalContent.querySelector('.cancel-optimizer');
        const applyBtn = modalContent.querySelector('.apply-optimized');
        
        // Optimize prompt when style changes
        styleSelect.addEventListener('change', () => {
            const optimizedPrompt = this.optimizePromptText(originalPrompt, styleSelect.value);
            optimizedTextarea.value = optimizedPrompt;
        });
        
        // Initial optimization
        const initialOptimized = this.optimizePromptText(originalPrompt, styleSelect.value);
        optimizedTextarea.value = initialOptimized;
        
        // Close modal handlers
        const closeModal = () => {
            document.body.removeChild(modalOverlay);
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        
        // Apply optimized prompt
        applyBtn.addEventListener('click', () => {
            const optimizedPrompt = optimizedTextarea.value.trim();
            if (optimizedPrompt) {
                this.messageInput.value = optimizedPrompt;
                this.messageInput.focus();
                closeModal();
            }
        });
    }

    optimizePromptText(prompt, style) {
        const optimizations = {
            professional: {
                prefix: "Please provide a professional and comprehensive response to the following query: ",
                suffix: " Please ensure your response is well-structured, accurate, and suitable for a professional context.",
                transform: (text) => text.replace(/^(hi|hello|hey)/i, "Greetings").replace(/!+$/, ".")
            },
            casual: {
                prefix: "Hey! I'd love to get your thoughts on this: ",
                suffix: " Feel free to be conversational and friendly in your response!",
                transform: (text) => text.replace(/^(greetings|good day)/i, "Hey").replace(/\.$/, "!")
            },
            detailed: {
                prefix: "Please provide a detailed and comprehensive analysis of the following: ",
                suffix: " Please include relevant examples, explanations, and context to ensure a thorough understanding.",
                transform: (text) => text + " (Please provide detailed explanations and examples)"
            },
            concise: {
                prefix: "Please provide a clear and concise response to: ",
                suffix: " Please keep your response direct and to the point.",
                transform: (text) => text.replace(/\s+/g, ' ').trim()
            },
            creative: {
                prefix: "Let's get creative! I'd love to see your imaginative take on: ",
                suffix: " Feel free to be creative, innovative, and engaging in your response!",
                transform: (text) => text.replace(/^(what is|how do|explain)/i, "What's your creative perspective on")
            },
            technical: {
                prefix: "Please provide a technical and precise analysis of: ",
                suffix: " Please include relevant technical details, specifications, and accurate information.",
                transform: (text) => text + " (Please provide technical details and specifications)"
            },
            educational: {
                prefix: "I'd like to learn more about this topic. Please explain: ",
                suffix: " Please provide educational content that helps me understand this topic thoroughly.",
                transform: (text) => text.replace(/^(what is|how do)/i, "Can you teach me about")
            },
            conversational: {
                prefix: "I'm curious about this and would love to chat about: ",
                suffix: " Please respond in a natural, conversational way as if we're having a friendly discussion.",
                transform: (text) => text.replace(/^(what|how|why|when|where)/i, "What do you think about")
            }
        };
        
        const optimization = optimizations[style] || optimizations.professional;
        let optimizedText = optimization.transform(prompt);
        
        // Add prefix and suffix
        optimizedText = optimization.prefix + optimizedText + optimization.suffix;
        
        return optimizedText;
    }

    openSettings() {
        // TODO: Implement settings functionality
        alert('Settings feature coming soon!');
    }

    closeComparePopoutModal() {
        if (this.comparePopoutModal) {
            this.comparePopoutModal.classList.remove('active');
        }
    }

    // Template Suggestions Methods
    showTemplateSuggestions() {
        this.templateSuggestionsContainer = templateModule.showTemplateSuggestions(
            this.messageInput,
            this.templateSuggestionsContainer,
            () => templateModule.createTemplateSuggestionsContainer(),
            (template) => this.openTemplateQAModal(template)
        );
    }
    
    hideTemplateSuggestions() {
        templateModule.hideTemplateSuggestions(this.templateSuggestionsContainer);
    }
    
    createTemplateSuggestionsContainer() {
        this.templateSuggestionsContainer = templateModule.createTemplateSuggestionsContainer();
        return this.templateSuggestionsContainer;
    }
    
    openTemplateQAModal(template) {
        templateModule.openTemplateQAModal(template, (prompt) => {
            // Set the prompt in the message input
            this.messageInput.value = prompt;
            
            // Focus the message input
            this.messageInput.focus();
            this.updateSendButtonState();
        });
    }
    
    generatePromptFromTemplate(template, answers) {
        return templateModule.generatePromptFromTemplate(template, answers);
    }
    




    // Update attachment button state based on selected models
    updateAttachmentButtonState() {
        const attachmentButton = document.querySelector('.attachment-btn');
        if (!attachmentButton) {
            console.warn('⚠️ Attachment button not found');
            return;
        }
        
        // Check if any Gemini models are selected
        const geminiModelKeys = ['gemini-2.5-flash', 'gemini-2.0-flash'];
        const hasGeminiSelected = this.selectedModels.some(modelId => geminiModelKeys.includes(modelId));
        
        console.log('🔍 Attachment button state check:');
        console.log('- Selected models:', this.selectedModels);
        console.log('- Gemini model keys:', geminiModelKeys);
        console.log('- Has Gemini selected:', hasGeminiSelected);
        
        if (hasGeminiSelected) {
            attachmentButton.disabled = false;
            attachmentButton.style.opacity = '1';
            attachmentButton.style.cursor = 'pointer';
            attachmentButton.title = 'Attach text files (only supported by Gemini models)';
            console.log('✅ Attachment button enabled');
        } else {
            attachmentButton.disabled = true;
            attachmentButton.style.opacity = '0.5';
            attachmentButton.style.cursor = 'not-allowed';
            attachmentButton.title = 'File attachments only available with Gemini models';
            console.log('❌ Attachment button disabled');
        }
    }

    // Test resize functionality
    testResizeFunctionality() {
        console.log('🧪 Testing resize functionality...');
        
        const resizeHandle = document.querySelector('#resize-handle');
        const rightSidebar = document.querySelector('#right-sidebar');
        
        console.log('🔍 Resize handle found:', !!resizeHandle);
        console.log('🔍 Right sidebar found:', !!rightSidebar);
        
        if (resizeHandle) {
            console.log('🔍 Resize handle properties:');
            console.log('- Display:', window.getComputedStyle(resizeHandle).display);
            console.log('- Visibility:', window.getComputedStyle(resizeHandle).visibility);
            console.log('- Opacity:', window.getComputedStyle(resizeHandle).opacity);
            console.log('- Cursor:', window.getComputedStyle(resizeHandle).cursor);
            console.log('- Z-index:', window.getComputedStyle(resizeHandle).zIndex);
            console.log('- Position:', window.getComputedStyle(resizeHandle).position);
            
            // Test click event
            resizeHandle.addEventListener('click', () => {
                console.log('✅ Resize handle clicked!');
            });
            
            console.log('✅ Click event listener added to resize handle');
        }
        
        if (rightSidebar) {
            console.log('🔍 Right sidebar properties:');
            console.log('- Width:', rightSidebar.offsetWidth);
            console.log('- Display:', window.getComputedStyle(rightSidebar).display);
            console.log('- Position:', window.getComputedStyle(rightSidebar).position);
            console.log('- Classes:', rightSidebar.className);
        }
        
        // Check if resize handle is in the DOM
        const allResizeHandles = document.querySelectorAll('.resize-handle');
        console.log('🔍 All resize handles found:', allResizeHandles.length);
        
        // Check right sidebar controls
        const controls = document.querySelector('.right-sidebar-controls');
        console.log('🔍 Right sidebar controls found:', !!controls);
        if (controls) {
            console.log('🔍 Controls HTML:', controls.innerHTML);
        }
    }

    // Force reset layout
    resetLayout() {
        console.log('🔄 Resetting layout...');
        
        const mainContent = document.querySelector('.main-content');
        const rightSidebar = document.querySelector('#right-sidebar');
        
        if (mainContent) {
            mainContent.style.marginRight = '';
            mainContent.style.width = '';
            mainContent.classList.remove('with-right-sidebar');
            console.log('✅ Reset main content styles');
        }
        
        if (rightSidebar) {
            rightSidebar.style.width = '';
            rightSidebar.classList.remove('open');
            console.log('✅ Reset right sidebar styles');
        }
        
        // Show expand button
        const expandBtn = document.querySelector('#expand-right-sidebar');
        if (expandBtn) {
            expandBtn.classList.add('show');
            console.log('✅ Showed expand button');
        }
        
        console.log('✅ Layout reset complete');
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.prudenceAI = new PrudenceAIV2();
    initializeThemeToggle();
});

// ===== HELPER FUNCTIONS =====

// Pretty JSON viewer function
function renderJsonAsHtml(obj, indent = 0) {
    let html = '';
    if (Array.isArray(obj)) {
        html += '[<br>';
        obj.forEach((item, idx) => {
            html += '&nbsp;'.repeat(indent + 2) + renderJsonAsHtml(item, indent + 2) + (idx < obj.length - 1 ? ',' : '') + '<br>';
        });
        html += '&nbsp;'.repeat(indent) + ']';
    } else if (typeof obj === 'object' && obj !== null) {
        html += '{<br>';
        Object.entries(obj).forEach(([key, value], idx, arr) => {
            html += '&nbsp;'.repeat(indent + 2) + `<span style="color:#20603d;font-weight:bold;">"${key}"</span>: ` + renderJsonAsHtml(value, indent + 2) + (idx < arr.length - 1 ? ',' : '') + '<br>';
        });
        html += '&nbsp;'.repeat(indent) + '}';
    } else if (typeof obj === 'string') {
        html += `<span style="color:#a31515;">"${obj}"</span>`;
    } else {
        html += `<span style="color:#1a1a1a;">${obj}</span>`;
    }
    return html;
} 

window.testTxtFileReading = async function() {
    console.log('🧪 Testing text file reading for Gemini models...');
    
    // Create test text file
    const testTextContent = "This is a test text file.\nIt contains multiple lines.\nThis will be read by Gemini models only.";
    const testTextFile = new File([testTextContent], 'test.txt', { type: 'text/plain' });
    
    // Test the file processing
    try {
        const supportedFiles = [testTextFile];
        console.log('✅ Test file created successfully');
        
        // Simulate the file processing
        for (const file of supportedFiles) {
            console.log(`📖 Testing file: ${file.name}`);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                console.log('✅ Text file processed:', content);
            };
            reader.readAsText(file);
        }
        
        console.log('✅ Text file processing test successful!');
        alert('✅ Text file processing test successful! Check console for details.');
        
    } catch (error) {
        console.error('❌ Test error:', error);
        alert('❌ Test error: ' + error.message);
    }
};

// Test function for debugging dropdown functionality
window.testDropdown = function() {
    console.log('🧪 Testing dropdown functionality...');
    
    // Test if elements exist
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownContent = document.querySelector('.dropdown-content');
    const modelOptions = document.querySelectorAll('.model-option');
    
    console.log('🔍 Elements found:');
    console.log('- Dropdown toggle:', !!dropdownToggle);
    console.log('- Dropdown content:', !!dropdownContent);
    console.log('- Model options:', modelOptions.length);
    
    // Test dropdown toggle
    if (dropdownToggle) {
        console.log('🖱️ Clicking dropdown toggle...');
        dropdownToggle.click();
        
        setTimeout(() => {
            const isActive = dropdownContent?.classList.contains('active');
            console.log('✅ Dropdown active state:', isActive);
            
            // Test clicking a model option
            if (modelOptions.length > 0) {
                console.log('🖱️ Clicking first model option...');
                modelOptions[0].click();
            }
        }, 100);
    }
    
    console.log('✅ Dropdown test completed');
};

// ===== HELPER FUNCTIONS =====

// Global function to test resize functionality
window.testResize = function() {
    if (window.app && window.app.testResizeFunctionality) {
        window.app.testResizeFunctionality();
    } else {
        console.log('❌ App not found or test function not available');
    }
};

// Global function to reinitialize resize functionality
window.reinitResize = function() {
    if (window.app && window.app.initializeRightSidebar) {
        window.app.initializeRightSidebar();
        console.log('✅ Resize functionality reinitialized');
    } else {
        console.log('❌ App not found or initialize function not available');
    }
};

// Global function to reset layout
window.resetLayout = function() {
    if (window.app && window.app.resetLayout) {
        window.app.resetLayout();
    } else {
        console.log('❌ App not found or reset function not available');
    }
};

// Global function to test resize handle manually
window.testResizeHandle = function() {
    console.log('🧪 Testing resize handle manually...');
    
    const resizeHandle = document.querySelector('#resize-handle');
    const rightSidebar = document.querySelector('#right-sidebar');
    
    console.log('🔍 Resize handle element:', resizeHandle);
    console.log('🔍 Right sidebar element:', rightSidebar);
    
    if (resizeHandle) {
        console.log('🔍 Resize handle properties:');
        const styles = window.getComputedStyle(resizeHandle);
        console.log('- Display:', styles.display);
        console.log('- Visibility:', styles.visibility);
        console.log('- Opacity:', styles.opacity);
        console.log('- Cursor:', styles.cursor);
        console.log('- Z-index:', styles.zIndex);
        console.log('- Position:', styles.position);
        console.log('- Left:', styles.left);
        console.log('- Width:', styles.width);
        console.log('- Height:', styles.height);
        console.log('- Background:', styles.background);
        
        // Test if it's clickable
        console.log('🔍 Testing clickability...');
        resizeHandle.click();
        
        // Test if it's visible
        const rect = resizeHandle.getBoundingClientRect();
        console.log('🔍 Bounding rect:', rect);
        console.log('🔍 Is visible:', rect.width > 0 && rect.height > 0);
        
        // Make it more visible for testing
        resizeHandle.style.background = 'red';
        resizeHandle.style.border = '2px solid blue';
        console.log('🔍 Made resize handle red with blue border for testing');
        
    } else {
        console.error('❌ Resize handle not found!');
        
        // Check if the right sidebar exists
        if (rightSidebar) {
            console.log('🔍 Right sidebar HTML:', rightSidebar.innerHTML);
        }
        
        // Check all elements with resize-handle class
        const allResizeHandles = document.querySelectorAll('.resize-handle');
        console.log('🔍 All elements with resize-handle class:', allResizeHandles);
        
        // Check all elements with id resize-handle
        const allById = document.querySelectorAll('#resize-handle');
        console.log('🔍 All elements with id resize-handle:', allById);
    }
};
