// Lógica del editor de código

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // Contenido inicial para el editor
    const initialCode = `// Bienvenido al Editor de Código
function saludar() {
    console.log("¡Hola, mundo!");
}

saludar();
`;

    // Obtiene el contenedor del editor del DOM
    const editorContainer = document.getElementById('editor-container');

    // Crea el estado inicial del editor con el contenido y las extensiones
    const initialState = cm6.createEditorState(initialCode);

    // Crea la vista del editor, asociándola al estado y al contenedor
    const view = cm6.createEditorView(initialState, editorContainer);

    // Adjunta la vista al objeto window para poder acceder a ella desde la consola
    window.editorView = view;

    // --- Funcionalidad de la Barra de Herramientas ---

    const saveBtn = document.getElementById('save-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    // Guardar
    saveBtn.addEventListener('click', () => {
        const code = view.state.doc.toString();
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'script.ces';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Deshacer
    undoBtn.addEventListener('click', () => {
        // cm6.undo es una función de comando que necesita ser "despachada"
        cm6.undo(view);
    });

    // Rehacer
    redoBtn.addEventListener('click', () => {
        // cm6.redo es una función de comando que necesita ser "despachada"
        cm6.redo(view);
    });


    console.log("Editor de código CodeMirror 6 inicializado y controles conectados.");
});
