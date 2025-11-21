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
        if (event.dataTransfer.getData('source') === 'canvas') return;

        const blockId = event.dataTransfer.getData('text/plain');
        const blockDef = blockDefinitions.find(b => b.id === blockId);
        if (blockDef) {
            // Create a new script container for the new block
            const scriptContainer = document.createElement('div');
            scriptContainer.className = 'script-container';

            const blockElement = createCanvasBlock(blockDef);
            scriptContainer.appendChild(blockElement);

            // Position the new script container
            const panelRect = rightPanel.getBoundingClientRect();
            scriptContainer.style.position = 'absolute';
            scriptContainer.style.left = `${event.clientX - panelRect.left}px`;
            scriptContainer.style.top = `${event.clientY - panelRect.top}px`;

            rightPanel.appendChild(scriptContainer);
        }
    });

    function createCanvasBlock(blockDef) {
        const blockElement = document.createElement('div');
        blockElement.className = 'block dropped';
        blockElement.innerHTML = createBlockHTML(blockDef.text);
        blockElement.style.backgroundColor = blockDef.color;
        blockElement.dataset.blockId = blockDef.id;

        if (blockDef.isContainer) {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            blockElement.appendChild(dropZone);
        }
        return blockElement;
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
        if (event.target.classList.contains('editable-field')) return;

        const targetBlock = event.target.closest('.block.dropped');
        if (!targetBlock) return;

        activeBlock = targetBlock;
        event.stopPropagation();

        // Detach the block from its current container to drag it freely
        const originalContainer = activeBlock.closest('.script-container, .drop-zone');
        const rect = activeBlock.getBoundingClientRect();
        const panelRect = rightPanel.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        // Move block to the top level for dragging
        rightPanel.appendChild(activeBlock);
        activeBlock.style.left = `${rect.left - panelRect.left}px`;
        activeBlock.style.top = `${rect.top - panelRect.top}px`;

        activeBlock.classList.add('dragging-canvas');
        activeBlock.style.zIndex = 1000;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(event) {
        if (!activeBlock) return;
        const panelRect = rightPanel.getBoundingClientRect();
        activeBlock.style.left = `${event.clientX - panelRect.left - offsetX}px`;
        activeBlock.style.top = `${event.clientY - panelRect.top - offsetY}px`;

        highlightDropZones(event.clientX, event.clientY);
    }

    function onMouseUp(event) {
        if (!activeBlock) return;

        const dropTarget = findDropTarget(event.clientX, event.clientY);

        if (dropTarget) {
            if (dropTarget.classList.contains('drop-zone')) {
                nestBlock(activeBlock, dropTarget);
            } else if (dropTarget.classList.contains('block')) {
                snapBlock(activeBlock, dropTarget);
            }
        } else {
            // If dropped in an empty space, create a new script container
            const scriptContainer = document.createElement('div');
            scriptContainer.className = 'script-container';
            scriptContainer.appendChild(activeBlock);
            rightPanel.appendChild(scriptContainer);

            // Position the new script
            const panelRect = rightPanel.getBoundingClientRect();
            scriptContainer.style.position = 'absolute';
            scriptContainer.style.left = `${event.clientX - panelRect.left - offsetX}px`;
            scriptContainer.style.top = `${event.clientY - panelRect.top - offsetY}px`;
        }

        // Cleanup styles
        clearHighlights();
        activeBlock.classList.remove('dragging-canvas');
        activeBlock.style.zIndex = '';
        activeBlock.style.left = '';
        activeBlock.style.top = '';
        activeBlock.style.position = ''; // Reset position
        activeBlock = null;

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Cleanup empty script containers
        cleanupEmptyContainers();
    }

    function highlightDropZones(clientX, clientY) {
        clearHighlights();
        const target = findDropTarget(clientX, clientY);
        if (target) {
            target.classList.add('drop-zone-active');
        }
    }

    function findDropTarget(clientX, clientY) {
        const dropTargets = Array.from(document.querySelectorAll('.block.dropped, .drop-zone'));
        let bestTarget = null;
        let minDistance = Infinity;

        for (const target of dropTargets) {
            if (target === activeBlock || activeBlock.contains(target)) {
                continue; // Skip the block being dragged or its children
            }

            const rect = target.getBoundingClientRect();

            // Check if the cursor is within the horizontal bounds of the target
            if (clientX >= rect.left && clientX <= rect.right) {
                // Prioritize drop-zones
                if (target.classList.contains('drop-zone')) {
                    // If cursor is inside a drop-zone, it's the best target
                    if (clientY >= rect.top && clientY <= rect.bottom) {
                        return target;
                    }
                }

                // For snapping to other blocks, check vertical proximity
                const distance = Math.abs(clientY - rect.bottom); // Check distance to the bottom edge
                if (distance < 30 && distance < minDistance) { // 30px snap threshold
                    minDistance = distance;
                    bestTarget = target;
                }
            }
        }

        return bestTarget;
    }

    function nestBlock(block, dropZone) {
        dropZone.appendChild(block);
    }

    function snapBlock(block, targetBlock) {
        // Insert the active block directly after the target block in the DOM
        targetBlock.parentNode.insertBefore(block, targetBlock.nextSibling);
    }

    function clearHighlights() {
        document.querySelectorAll('.drop-zone-active').forEach(el => {
            el.classList.remove('drop-zone-active');
        });
    }

    function cleanupEmptyContainers() {
        document.querySelectorAll('.script-container, .drop-zone').forEach(container => {
            if (container.children.length === 0 && container.className !== 'right-panel') {
                container.remove();
            }
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
        // Find all top-level scripts that start with a "hat" block
        document.querySelectorAll('.script-container').forEach(script => {
            const hatBlock = script.querySelector(':scope > .block[data-block-id="when_key_pressed"]');
            if (hatBlock) {
                const keyInput = hatBlock.querySelector('.editable-field');
                const keyToPress = keyInput ? keyInput.value.toLowerCase() : ' ';

                if (pressedKeys.has(keyToPress)) {
                    // Start execution from the block *after* the hat block
                    executeScript(hatBlock.nextElementSibling);
                }
            }
        });
    }

    function executeScript(startBlock) {
        let currentBlock = startBlock;
        while (currentBlock) {
            const blockId = currentBlock.dataset.blockId;
            const blockFunction = blockFunctions[blockId];

            if (blockFunction) {
                blockFunction(currentBlock);
            }

            // Move to the next block in the same sequence
            currentBlock = currentBlock.nextElementSibling;
        }
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
        },
        'if_then': (block) => {
            // Placeholder for condition checking. For now, it's always true.
            const condition = true;
            if (condition) {
                const dropZone = block.querySelector('.drop-zone');
                if (dropZone) {
                    // Execute the script nested inside the 'if' block
                    executeScript(dropZone.firstElementChild);
                }
            }
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
