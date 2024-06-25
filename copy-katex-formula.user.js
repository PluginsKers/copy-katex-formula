// ==UserScript==
// @name         Copy KaTeX Formula to Markdown
// @namespace    http://github.com/PluginsKers
// @version      0.5
// @description  Add a copy button next to KaTeX formulas to copy them as Markdown LaTeX format
// @author       PluginsKers
// @match        chatgpt.com/c/*
// @match        chat.openai.com/chat/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to add copy button to a single KaTeX element
    function addCopyButton(katexElement) {
        // Check if the button already exists to prevent duplicates
        if (katexElement.querySelector('.copy-button')) return;

        // Create a copy button
        const copyButton = document.createElement('button');
        copyButton.innerText = 'Copy';
        copyButton.classList.add('copy-button');
        copyButton.style.position = 'absolute';
        copyButton.style.top = '0';
        copyButton.style.right = '0';
        copyButton.style.cursor = 'pointer';
        copyButton.style.backgroundColor = '#f0f0f0';
        copyButton.style.border = '1px solid #ccc';
        copyButton.style.borderRadius = '4px';
        copyButton.style.fontSize = '10px';
        copyButton.style.padding = '0px 2px';
        copyButton.style.display = 'none'; // Initially hidden

        // Add click event listener to the copy button
        copyButton.addEventListener('click', () => {
            const latexSource = katexElement.querySelector('.katex-mathml annotation').textContent; // Extract the LaTeX source
            const markdownLatex = `$${latexSource}$`; // Convert to Markdown LaTeX format
            copyToClipboard(markdownLatex); // Copy to clipboard

            // Optional: Provide visual feedback
            copyButton.innerText = 'Copied!';
            setTimeout(() => {
                copyButton.innerText = 'Copy';
            }, 2000);
        });

        // Create a wrapper to position the copy button
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        katexElement.parentElement.insertBefore(wrapper, katexElement);
        wrapper.appendChild(katexElement);
        wrapper.appendChild(copyButton);

        // Show copy button on hover
        wrapper.addEventListener('mouseenter', () => {
            copyButton.style.display = 'inline-block';
        });

        // Hide copy button when not hovering
        wrapper.addEventListener('mouseleave', () => {
            copyButton.style.display = 'none';
        });
    }

    // Function to copy text to clipboard using Clipboard API
    async function copyToClipboard(text) {
        try {
            text = text.replace("\\frac", "\\dfrac"); // Optional: Modify LaTeX syntax if needed
            await navigator.clipboard.writeText(text);
            console.log('Copied to clipboard successfully!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    // Function to add copy buttons to all KaTeX elements
    function addCopyButtons() {
        // Select all KaTeX elements on the page
        const katexElements = document.querySelectorAll('.katex');

        katexElements.forEach((katexElement) => {
            addCopyButton(katexElement);
        });
    }

    // Debounce function to limit the rate of function execution
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Optimized function to observe the document for added nodes
    const optimizedAddCopyButtons = debounce(addCopyButtons, 300);

    // Observe the document for added nodes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && (node.matches('.katex') || node.querySelector('.katex'))) {
                        optimizedAddCopyButtons();
                    }
                });
            }
        });
    });

    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial run to add copy buttons to already existing KaTeX elements
    addCopyButtons();
})();
