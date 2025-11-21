// Main script for the editor logic
document.addEventListener('DOMContentLoaded', () => {
    const blocksContainer = document.querySelector('.blocks-container');
    const categoriesContainer = document.querySelector('.categories-container');

    // --- Block and Category Definitions ---
    const blockDefinitions = [
        { id: 'move', text: 'Move (10) steps', category: 'Motion', color: '#4C97FF' },
        { id: 'turn_right', text: 'Turn clockwise (15) degrees', category: 'Motion', color: '#4C97FF' },
        { id: 'turn_left', text: 'Turn counter-clockwise (15) degrees', category: 'Motion', color: '#4C97FF' },
        { id: 'when_key_pressed', text: 'When (space) key pressed', category: 'Events', color: '#FFBF00' },
        { id: 'if_then', text: 'if <> then', category: 'Control', color: '#FFAB19', isContainer: true }
    ];

    const categories = ['All', 'Motion', 'Events', 'Control'];

    // --- Functions to Render UI ---

    function renderCategories() {
        categoriesContainer.innerHTML = ''; // Clear existing categories
        categories.forEach(category => {
            const categoryButton = document.createElement('button');
            categoryButton.textContent = category;
            categoryButton.dataset.category = category;
            categoryButton.addEventListener('click', () => renderBlocks(category));
            categoriesContainer.appendChild(categoryButton);
        });
    }

    function renderBlocks(category = 'All') {
        blocksContainer.innerHTML = ''; // Clear existing blocks
        const filteredBlocks = category === 'All'
            ? blockDefinitions
            : blockDefinitions.filter(block => block.category === category);

        filteredBlocks.forEach(blockDef => {
            const blockElement = document.createElement('div');
            blockElement.className = 'block';
            blockElement.innerHTML = createBlockHTML(blockDef.text); // Use innerHTML
            blockElement.style.backgroundColor = blockDef.color;
            blockElement.draggable = true; // Make the block draggable
            blockElement.dataset.blockId = blockDef.id;

            // Add drag start event
            blockElement.addEventListener('dragstart', (event) => {
                // Prevent drag if the target is an input field
                if (event.target.classList.contains('editable-field')) {
                    event.preventDefault();
                    return;
                }
                event.dataTransfer.setData('text/plain', blockDef.id);
                event.target.classList.add('dragging');
            });

            // Add drag end event to clean up styles
            blockElement.addEventListener('dragend', (event) => {
                event.target.classList.remove('dragging');
            });

            blocksContainer.appendChild(blockElement);
        });
    }

    // --- Drag and Drop Logic ---
    const rightPanel = document.querySelector('.right-panel');

    // Part 1: Dragging from the palette to the canvas
    rightPanel.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    rightPanel.addEventListener('drop', (event) => {
        event.preventDefault();
        // Check if the drag originated from within the canvas itself
        if (event.dataTransfer.getData('source') === 'canvas') return;

        const blockId = event.dataTransfer.getData('text/plain');
        const blockDef = blockDefinitions.find(b => b.id === blockId);
        if (blockDef) {
            createCanvasBlock(blockDef, event.clientX, event.clientY);
        }
    });

    function createCanvasBlock(blockDef, clientX, clientY) {
        const blockElement = document.createElement('div');
        blockElement.className = 'block dropped';
        blockElement.innerHTML = createBlockHTML(blockDef.text);
        blockElement.style.backgroundColor = blockDef.color;
        blockElement.dataset.blockId = blockDef.id;

        // If it's a container, add a drop zone
        if (blockDef.isContainer) {
            // Append drop zone without overwriting the input fields
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            blockElement.appendChild(dropZone);
        }

        const panelRect = rightPanel.getBoundingClientRect();
        blockElement.style.left = `${clientX - panelRect.left}px`;
        blockElement.style.top = `${clientY - panelRect.top}px`;
        rightPanel.appendChild(blockElement);
    }

    function createBlockHTML(text) {
        // Regex to find placeholders like (10) or (space)
        const regex = /\(([^)]+)\)/g;
        return text.replace(regex, (match, value) => {
            const isNumeric = !isNaN(parseFloat(value));
            const inputType = isNumeric ? 'number' : 'text';
            return `<input type="${inputType}" value="${value}" class="editable-field" size="${value.length}">`;
        });
    }

    // Part 2: Dragging blocks already on the canvas
    let activeBlock = null;
    let offsetX = 0;
    let offsetY = 0;

    rightPanel.addEventListener('mousedown', (event) => {
        // Prevent starting a drag from an editable field
        if (event.target.classList.contains('editable-field')) {
            return;
        }

        const targetBlock = event.target.closest('.block.dropped');
        if (!targetBlock) return;

        activeBlock = targetBlock;
        event.stopPropagation();

        // If the block was nested, move it to the panel to drag it freely
        if (activeBlock.parentElement.classList.contains('drop-zone')) {
            const parentRect = activeBlock.parentElement.getBoundingClientRect();
            const panelRect = rightPanel.getBoundingClientRect();
            activeBlock.style.left = `${parentRect.left - panelRect.left}px`;
            activeBlock.style.top = `${parentRect.top - panelRect.top}px`;
            rightPanel.appendChild(activeBlock);
            activeBlock.style.position = 'absolute';
        }

        const rect = activeBlock.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        activeBlock.classList.add('dragging-canvas');
        activeBlock.style.zIndex = 1000;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(event) {
        if (!activeBlock) return;
        const panelRect = rightPanel.getBoundingClientRect();
        let newLeft = event.clientX - panelRect.left - offsetX;
        let newTop = event.clientY - panelRect.top - offsetY;

        activeBlock.style.left = `${newLeft}px`;
        activeBlock.style.top = `${newTop}px`;

        // Highlight potential drop zones
        highlightDropZones(event.clientX, event.clientY);
    }

    function onMouseUp(event) {
        if (!activeBlock) return;

        const dropTarget = findDropTarget(event.clientX, event.clientY);

        if (dropTarget) {
            if (dropTarget.classList.contains('drop-zone')) {
                // Nesting logic
                nestBlock(activeBlock, dropTarget);
            } else {
                // Snapping logic
                snapBlock(activeBlock, dropTarget);
            }
        }

        clearHighlights();
        activeBlock.classList.remove('dragging-canvas');
        activeBlock.style.zIndex = '';
        activeBlock = null;

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function highlightDropZones(clientX, clientY) {
        clearHighlights();
        const target = findDropTarget(clientX, clientY);
        if (target) {
            target.classList.add('drop-zone-active');
        }
    }

    function findDropTarget(clientX, clientY) {
        const elements = document.elementsFromPoint(clientX, clientY);
        // Find the first valid drop target that isn't the active block itself or a child of it
        return elements.find(el =>
            (el.classList.contains('dropped') || el.classList.contains('drop-zone')) &&
            el !== activeBlock &&
            !activeBlock.contains(el)
        );
    }

    function nestBlock(block, dropZone) {
        dropZone.appendChild(block);
        block.style.position = 'relative';
        block.style.left = '0';
        block.style.top = '0';
    }

    function snapBlock(block, targetBlock) {
        // Simple vertical snapping: append it after the target block
        targetBlock.parentNode.insertBefore(block, targetBlock.nextSibling);

        // This example uses DOM order for sequencing.
        // For visual snapping, we'd adjust top/left based on targetBlock's rect.
        // For simplicity, we'll handle visual layout with CSS for now.
        // Make blocks in sequence display vertically.
        if (targetBlock.parentElement.classList.contains('right-panel')) {
             // Reset styles for direct canvas children if needed later
        }
    }

    function clearHighlights() {
        document.querySelectorAll('.drop-zone-active').forEach(el => {
            el.classList.remove('drop-zone-active');
        });
    }

    // --- Initial Load ---
    renderCategories();
    renderBlocks(); // Show all blocks by default


    // --- Execution Engine ---
    const sprite = document.getElementById('sprite');

    const spriteState = {
        x: sprite.offsetLeft + sprite.offsetWidth / 2,
        y: sprite.offsetTop + sprite.offsetHeight / 2,
        rotation: 0
    };

    const pressedKeys = new Set();

    document.addEventListener('keydown', (event) => {
        pressedKeys.add(event.key.toLowerCase());
    });

    document.addEventListener('keyup', (event) => {
        pressedKeys.delete(event.key.toLowerCase());
    });

    function executeBlocks() {
        const hatBlocks = rightPanel.querySelectorAll('.block[data-block-id="when_key_pressed"]');

        hatBlocks.forEach(hat => {
            const keyInput = hat.querySelector('.editable-field');
            const keyToPress = keyInput ? keyInput.value.toLowerCase() : ' ';

            if (pressedKeys.has(keyToPress)) {
                let currentBlock = hat.nextElementSibling;
                while (currentBlock) {
                    const blockId = currentBlock.dataset.blockId;
                    if (blockFunctions[blockId]) {
                        // Pass the block element to the function to access its inputs
                        blockFunctions[blockId](currentBlock);
                    }
                    currentBlock = currentBlock.nextElementSibling;
                }
            }
        });
    }

    const blockFunctions = {
        'move': (block) => {
            const value = block.querySelector('.editable-field').value;
            const steps = parseFloat(value) || 0;
            const radians = spriteState.rotation * (Math.PI / 180);
            spriteState.x += steps * Math.cos(radians);
            spriteState.y += steps * Math.sin(radians);
        },
        'turn_right': (block) => {
            const value = block.querySelector('.editable-field').value;
            const degrees = parseFloat(value) || 0;
            spriteState.rotation += degrees;
        },
        'turn_left': (block) => {
            const value = block.querySelector('.editable-field').value;
            const degrees = parseFloat(value) || 0;
            spriteState.rotation -= degrees;
        }
    };

    function gameLoop() {
        executeBlocks();

        // Update sprite's visual position and rotation
        sprite.style.left = `${spriteState.x - sprite.offsetWidth / 2}px`;
        sprite.style.top = `${spriteState.y - sprite.offsetHeight / 2}px`;
        sprite.style.transform = `rotate(${spriteState.rotation}deg)`;

        requestAnimationFrame(gameLoop);
    }

    // Start the engine
    gameLoop();
});
