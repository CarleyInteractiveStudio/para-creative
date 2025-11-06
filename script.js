// Lógica del editor de código

document.addEventListener('DOMContentLoaded', () => {

    // --- Selectores de Elementos ---
    const editorContainer = document.getElementById('editor-container');
    const stcContainer = document.getElementById('stc-container');
    const pcModeBtn = document.getElementById('pc-mode');
    const stcModeBtn = document.getElementById('stc-mode');
    const saveBtn = document.getElementById('save-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const toolboxXml = document.getElementById('stc-toolbox-xml');

    // --- Inicialización del Editor de Código (CodeMirror) ---
    const initialCode = `// Bienvenido al Editor de Código\nfunction saludar() {\n    console.log("¡Hola, mundo!");\n}\nsaludar();`;
    const initialState = cm6.createEditorState(initialCode);
    const view = cm6.createEditorView(initialState, editorContainer);
    view.focus();
    window.editorView = view;

    // --- Inicialización del Editor de Bloques (Blockly) ---
    const blocklyWorkspace = Blockly.inject('stc-container', {
        toolbox: toolboxXml, // Usar la toolbox por defecto
        theme: Blockly.Themes.Dark,
        renderer: 'zelos'
    });
    window.blocklyWorkspace = blocklyWorkspace;

    // --- Lógica de Cambio de Modo ---
    function setActiveMode(mode) {
        if (mode === 'pc') {
            pcModeBtn.classList.add('active');
            stcModeBtn.classList.remove('active');
            editorContainer.style.display = 'block';
            stcContainer.style.display = 'none';
            view.focus();
        } else if (mode === 'stc') {
            stcModeBtn.classList.add('active');
            pcModeBtn.classList.remove('active');
            editorContainer.style.display = 'none';
            stcContainer.style.display = 'flex';
            Blockly.svgResize(blocklyWorkspace);
        }
    }

    stcContainer.style.display = 'none';
    pcModeBtn.addEventListener('click', () => setActiveMode('pc'));
    stcModeBtn.addEventListener('click', () => setActiveMode('stc'));

    window.addEventListener('resize', () => {
        if (stcContainer.style.display === 'flex') {
            Blockly.svgResize(blocklyWorkspace);
        }
    });

    // --- Lógica de Botones de Control ---
    saveBtn.addEventListener('click', () => {
        let code = '';
        if (pcModeBtn.classList.contains('active')) {
            code = view.state.doc.toString();
        } else {
            code = Blockly.JavaScript.workspaceToCode(blocklyWorkspace);
        }
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'script.ces';
        a.click();
        URL.revokeObjectURL(a.href);
    });

    undoBtn.addEventListener('click', () => {
        if (pcModeBtn.classList.contains('active')) cm6.undo(view);
        else blocklyWorkspace.undo(false);
    });

    redoBtn.addEventListener('click', () => {
        if (pcModeBtn.classList.contains('active')) cm6.redo(view);
        else blocklyWorkspace.undo(true);
    });

    console.log("Editores inicializados.");
});
