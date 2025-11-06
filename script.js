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

    // --- Inicialización del Editor de Código (CodeMirror) ---
    const initialCode = `// Bienvenido al Editor de Código\nfunction saludar() {\n    console.log("¡Hola, mundo!");\n}\nsaludar();`;
    const initialState = cm6.createEditorState(initialCode);
    const view = cm6.createEditorView(initialState, editorContainer);
    view.focus();
    window.editorView = view;

    // --- Inicialización del Editor de Bloques (Blockly) ---
    const stcWorkspacePanel = document.querySelector('.stc-workspace-panel');
    const blocklyWorkspace = Blockly.inject(stcWorkspacePanel, {
        toolbox: document.getElementById('stc-toolbox-xml'),
        theme: Blockly.Themes.Dark,
        renderer: 'zelos'
    });
    window.blocklyWorkspace = blocklyWorkspace;

    // --- Lógica de Cambio de Modo ---
    function setActiveMode(mode) {
        if (mode === 'pc') {
            pcModeBtn.classList.add('active');
            stcModeBtn.classList.remove('active');
            editorContainer.classList.remove('hidden');
            stcContainer.classList.add('hidden');
            view.focus(); // Devuelve el foco a CodeMirror
        } else if (mode === 'stc') {
            stcModeBtn.classList.add('active');
            pcModeBtn.classList.remove('active');
            stcContainer.classList.remove('hidden');
            editorContainer.classList.add('hidden');
            Blockly.svgResize(blocklyWorkspace); // Asegura que Blockly se redimensione
        }
    }

    pcModeBtn.addEventListener('click', () => setActiveMode('pc'));
    stcModeBtn.addEventListener('click', () => setActiveMode('stc'));

    // Redimensionar Blockly cuando la ventana cambie de tamaño
    window.addEventListener('resize', () => {
        if (!stcContainer.classList.contains('hidden')) {
            Blockly.svgResize(blocklyWorkspace);
        }
    });

    // --- Lógica de Botones de Control ---
    saveBtn.addEventListener('click', () => {
        let code = '';
        if (pcModeBtn.classList.contains('active')) {
            // Modo P.C.: Obtener código de CodeMirror
            code = view.state.doc.toString();
        } else {
            // Modo S.T.C.: Generar código desde Blockly
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
        if (pcModeBtn.classList.contains('active')) {
            cm6.undo(view);
        } else {
            blocklyWorkspace.undo(false);
        }
    });

    redoBtn.addEventListener('click', () => {
        if (pcModeBtn.classList.contains('active')) {
            cm6.redo(view);
        } else {
            blocklyWorkspace.undo(true);
        }
    });

    console.log("Editores inicializados y lógica de modos conectada.");
});
