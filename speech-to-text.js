(function() {
    // --- Módulo de Análisis de Texto ---

    class TextAnalyzer {
        constructor() {
            this.categories = {
                AYUDA: ["ayuda", "socorro", "auxilio", "ayudame"],
                ESTRÉS: ["joder", "maldicion", "mierda", "carajo"],
                ATAQUE: ["atacando", "disparando", "fuego", "atacad"],
                DEFENSA: ["cubridme", "posicion", "defendiendo", "cubranme"],
                AFIRMATIVO: ["si", "afirmativo", "entendido", "ok", "vale"],
                NEGATIVO: ["no", "negativo", "nada"]
            };
        }

        /**
         * Permite al usuario sobrescribir las categorías por defecto.
         * @param {object} newCategories - Un objeto con las nuevas categorías y listas de palabras.
         */
        defineCategories(newCategories) {
            if (typeof newCategories === 'object' && newCategories !== null) {
                this.categories = newCategories;
            }
        }

        /**
         * Analiza un texto y lo clasifica según las categorías definidas.
         * @param {string} text - El texto a analizar.
         * @returns {object} - Un objeto con el resultado del análisis.
         */
        analyze(text) {
            const analysisResult = {};
            const words = text.toLowerCase().split(/\s+/);

            // Inicializar el resultado del análisis
            for (const category in this.categories) {
                analysisResult[category] = { contador: 0, palabras: [] };
            }

            // Contar palabras de cada categoría
            words.forEach(word => {
                const cleanWord = word.replace(/[.,¡!¿?]/g, ''); // Limpiar puntuación
                for (const category in this.categories) {
                    if (this.categories[category].includes(cleanWord)) {
                        analysisResult[category].contador++;
                        analysisResult[category].palabras.push(cleanWord);
                    }
                }
            });

            return {
                textoCompleto: text,
                analisis: analysisResult
            };
        }
    }


    // --- Núcleo de la Librería de Voz a Texto ---

    class SpeechService {
        constructor() {
            // Comprobar compatibilidad del navegador
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.error("Speech Recognition API no es compatible con este navegador.");
                this.recognition = null;
                return;
            }

            this.recognition = new SpeechRecognition();
            this.analyzer = new TextAnalyzer(); // Instanciar el analizador
            this.isListening = false;

            // Callbacks que el usuario definirá
            this.onAnalysisCallback = () => {}; // Nuevo callback para el análisis
            this.onPartialResultCallback = () => {};
            this.onErrorCallback = () => {};
            this.onStartCallback = () => {};
            this.onEndCallback = () => {};

            this.setupListeners();
        }

        /**
         * Configura los listeners internos de la API de reconocimiento de voz.
         */
        setupListeners() {
            if (!this.recognition) return;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.onStartCallback();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.onEndCallback();
            };

            this.recognition.onerror = (event) => {
                this.onErrorCallback(event.error);
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    const analysisReport = this.analyzer.analyze(finalTranscript.trim());
                    this.onAnalysisCallback(analysisReport);
                }
                if (interimTranscript) {
                    this.onPartialResultCallback(interimTranscript.trim());
                }
            };
        }

        /**
         * Inicia la escucha del micrófono.
         * @param {string} lang - El idioma para el reconocimiento (ej. 'es-ES', 'en-US').
         */
        start(lang = 'es-ES') {
            if (!this.recognition || this.isListening) {
                return;
            }
            this.recognition.lang = lang;
            this.recognition.interimResults = true; // Para resultados parciales
            this.recognition.continuous = true; // Para que no se detenga tras la primera frase
            this.recognition.start();
        }

        /**
         * Detiene la escucha.
         */
        stop() {
            if (!this.recognition || !this.isListening) {
                return;
            }
            this.recognition.stop();
        }
    }

    // --- API para Creative Engine ---

    const speechService = new SpeechService();

    // El objeto que será devuelto para ser usado en scripts .ces
    const runtimeApi = {
        /**
         * Inicia la grabación del micrófono.
         * @param {string} [lang='es-ES'] - El código de idioma para el reconocimiento.
         */
        iniciarGrabacion: function(lang = 'es-ES') {
            speechService.start(lang);
        },

        /**
         * Detiene la grabación del micrófono.
         */
        detenerGrabacion: function() {
            speechService.stop();
        },

        /**
         * Establece la función a llamar cuando se recibe un resultado parcial.
         * @param {function(string)} callback - La función que manejará el texto parcial.
         */
        alRecibirTextoParcial: function(callback) {
            if (typeof callback === 'function') {
                speechService.onPartialResultCallback = callback;
            }
        },

        /**
         * Establece la función a llamar cuando se recibe un reporte de análisis.
         * @param {function(object)} callback - La función que manejará el objeto de análisis.
         */
        alRecibirAnalisis: function(callback) {
            if (typeof callback === 'function') {
                speechService.onAnalysisCallback = callback;
            }
        },

        /**
         * Permite al desarrollador definir sus propias categorías de análisis.
         * @param {object} categorias - El objeto con las nuevas categorías y palabras clave.
         */
        definirCategorias: function(categorias) {
            speechService.analyzer.defineCategories(categorias);
        },

        /**
         * Establece la función a llamar cuando ocurre un error.
         * @param {function(string)} callback - La función que manejará el error.
         */
        alOcurrirError: function(callback) {
            if (typeof callback === 'function') {
                speechService.onErrorCallback = callback;
            }
        }
    };

    // Devolvemos el objeto para que Creative Engine lo haga accesible desde los scripts .ces
    // PERO solo si CreativeEngine.API no está disponible (ej. estamos en el juego y no en el editor)
    // o si explícitamente se pide el modo runtime.
    // Esto es una suposición; en un caso real, la API del motor debería aclarar cómo diferenciar.
    if (typeof CreativeEngine === 'undefined' || !CreativeEngine.API || !CreativeEngine.API.registrarVentana) {
        return runtimeApi;
    }


    // --- API de la Ventana del Editor ---

    CreativeEngine.API.registrarVentana({
        nombre: "Demo de Análisis de Voz",
        alAbrir: function(panel) {
            panel.agregarTexto("Panel de Prueba: Análisis de Voz", { tamaño: 'grande' });

            let idiomaSeleccionado = 'es-ES';
            let categoriasPersonalizadas = JSON.stringify(speechService.analyzer.categories, null, 2);

            // --- Sección de Controles ---
            const controlesCont = panel.agregarContenedor({ direccion: 'horizontal' });
            const botonGrabar = controlesCont.agregarBoton("Iniciar Grabación", () => {
                if (speechService.isListening) {
                    runtimeApi.detenerGrabacion();
                } else {
                    runtimeApi.iniciarGrabacion(idiomaSeleccionado);
                }
            });
            controlesCont.agregarDropdown("Idioma:", ["es-ES", "en-US", "fr-FR", "de-DE"], {
                alCambiar: (op) => { idiomaSeleccionado = op; }
            });

            // --- Sección de Resultados ---
            panel.agregarTexto("Transcripción en vivo:", { tamaño: 'normal' });
            const transcripcionArea = panel.agregarTexto("...");

            panel.agregarTexto("Reporte de Análisis (JSON):", { tamaño: 'normal' });
            const reporteArea = panel.agregarAreaCodigo("El análisis aparecerá aquí...");
            const reporteCode = reporteArea.querySelector('code'); // Acceso al elemento code interno

            // --- Sección de Personalización ---
            panel.agregarTexto("Definir Categorías (JSON):", { tamaño: 'normal' });
            panel.agregarInputAreaTexto("Categorías:", {
                rows: 10,
                alCambiar: (valor) => { categoriasPersonalizadas = valor; }
            }).querySelector('textarea').value = categoriasPersonalizadas;

            panel.agregarBoton("Aplicar Nuevas Categorías", () => {
                try {
                    const nuevasCategorias = JSON.parse(categoriasPersonalizadas);
                    runtimeApi.definirCategorias(nuevasCategorias);
                    alert("¡Nuevas categorías aplicadas con éxito!");
                } catch (e) {
                    alert("Error en el formato JSON. Por favor, revísalo.");
                }
            });

            // --- Conectar Callbacks a la UI ---
            speechService.onStartCallback = () => {
                botonGrabar.innerText = "Detener Grabación";
                transcripcionArea.innerText = "Escuchando...";
                reporteCode.textContent = "Esperando resultado final para analizar...";
            };

            speechService.onEndCallback = () => {
                botonGrabar.innerText = "Iniciar Grabación";
            };

            speechService.onPartialResultCallback = (texto) => {
                transcripcionArea.innerText = texto;
            };

            speechService.onAnalysisCallback = (reporte) => {
                reporteCode.textContent = JSON.stringify(reporte, null, 2);
            };

            speechService.onErrorCallback = (error) => {
                transcripcionArea.innerText = `ERROR: ${error}`;
                reporteCode.textContent = `Error: ${error}`;
                botonGrabar.innerText = "Iniciar Grabación";
            };
        }
    });

    // Cuando se está en el editor, también devolvemos la API de runtime
    // para que pueda ser usada por otras herramientas del editor si fuera necesario.
    return runtimeApi;
})();
