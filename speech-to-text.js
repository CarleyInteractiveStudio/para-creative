(function() {
    // --- Módulo de Análisis de Texto ---

    class TextAnalyzer {
        constructor() {
            this.categories = {
                // --- TÁCTICAS Y COMBATE ---
                UNIDADES_Y_ROLES: ["soldado", "infanteria", "francotirador", "artilleria", "caballeria", "escuadron", "general", "comandante", "objetivo", "enemigo", "blanco", "contacto"],
                EQUIPO_Y_ARMAS: ["rifle", "pistola", "granada", "canon", "misil", "escudo", "chaleco", "casco", "bayoneta", "katana", "ak-47", "m4", "rpg", "mina", "dron", "bomba", "c4", "glock", "mp5", "escopeta", "subfusil", "lanzacohetes"],
                VEHICULOS: ["tanque", "jeep", "helicoptero", "submarino", "portaaviones", "destructor", "avion", "blindado", "moto", "camion", "humvee", "apc", "caza", "bombardero"],
                EQUIPO_ADICIONAL: ["mirilla", "silenciador", "cargador ampliado", "botiquin", "placas", "blindaje"],
                TERRENO_Y_UBICACIONES: ["trinchera", "bunker", "fortaleza", "base", "campo de batalla", "desierto", "bosque", "ciudad", "rio", "montaña", "puente", "torre", "edificio", "punto a"],
                COMANDOS_DE_ACCION: ["atacar", "defender", "flanquear", "retirarse", "avanzar", "cargar", "emboscar", "patrullar", "reconocer", "capturar", "fuego", "disparad", "cubridme", "muevete"],
                ESTRATEGIA_Y_SUMINISTROS: ["plan", "formacion", "linea de frente", "refuerzos", "inteligencia", "contraataque", "operacion", "maniobra", "logistica", "suministros", "recargando", "sin municion"],
                ALERTAS_DE_COMBATE: ["esta a un toque", "enemigo abatido", "en mi posicion", "necesito curacion", "me estan dando", "blanco marcado", "lo veo", "esta aqui", "recibido"],

                // --- ESTADO Y EMOCIONES ---
                CONDICION_DE_COMBATE: ["victoria", "derrota", "rendicion", "moral", "fatiga", "herido", "eliminado", "oculto", "descubierto", "neutralizado", "tango abatido"],
                IRA_ODIO: ["rabia", "odio", "muere", "cabrones", "pagaran", "matadlos", "hijos de puta", "infelices", "os voy a matar", "me cago en sus muertos"],
                FRUSTRACION: ["no puede ser", "otra vez", "he fallado", "no me sale", "estoy harto", "maldita sea"],
                HUMOR_BURLA: ["jaja", "jajaja", "jeje", "que facil", "manco", "paquete", "claro que si", "buena idea"],
                MIEDO_ANSIEDAD: ["miedo", "asustado", "joder", "cuidado", "retirada", "nos matan", "demasiados", "no quiero morir", "es una trampa", "nos van a joder", "estoy temblando"],
                SORPRESA_SHOCK: ["hostia", "de donde", "no lo vi", "que cono", "que ha pasado", "no entiendo", "estoy solo", "no me jodas"],
                DETERMINACION_VALOR: ["esta vez si", "ahora caen", "voy a por ellos", "no se escapan", "adelante", "sin miedo", "por la gloria", "vamos", "resistid"],
                CONFIANZA: ["lo tengo", "pan comido", "facil", "soy el mejor", "controlado", "es mio", "uno menos", "estoy seguro"],
                DUDA: ["no estoy seguro", "creo que no", "dudo", "quizas", "es arriesgado", "no se si"],
                TRISTEZA_PENA: ["caido", "lo perdimos", "no", "por que", "lo siento", "pena", "dolor", "un hombre menos", "no lo logro", "descansa en paz"],
                CULPA_NOSTALGIA: ["mi culpa", "debi haber", "si yo hubiera", "lo siento tanto", "fue por mi", "casa", "como echo de menos", "cuando esto acabe"],
                DESESPERACION_IMPOTENCIA: ["no hay salida", "estamos jodidos", "es el fin", "rendimos", "sin esperanza", "imposible", "estamos atrapados", "no hay nada que hacer", "estamos muertos"],

                // --- COMUNICACIÓN ---
                AFIRMATIVO: ["si", "afirmativo", "entendido", "ok", "vale", "copiado", "recibido", "a la orden", "hecho", "procedo"],
                NEGATIVO: ["no", "negativo", "nada", "imposible", "no puedo", "mision abortada", "cancelado", "incapaz"],
                PREGUNTA: ["donde", "que", "quien", "como", "cuando", "por que", "cual es la orden", "estado", "informe", "me recibes"],

                // --- JERGA GAMER ---
                JERGA_GAMER: ["campero", "gankear", "mochazo", "rushear", "respawnear", "headshot", "nerfear", "buffear", "lootear", "farmear", "lag", "noob", "pro"]
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
        /**
         * Normaliza un texto eliminando acentos y convirtiéndolo a minúsculas.
         * @param {string} text - El texto a normalizar.
         * @returns {string} - El texto normalizado.
         */
        _normalize(text) {
            return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }

        analyze(text) {
            const analysisResult = {};
            const words = text.split(/\s+/);

            // Inicializar el resultado del análisis
            for (const category in this.categories) {
                analysisResult[category] = { contador: 0, palabras: [] };
            }

            // Contar palabras de cada categoría
            words.forEach(word => {
                const cleanWord = this._normalize(word.replace(/[.,¡!¿?]/g, ''));
                for (const category in this.categories) {
                    const normalizedKeywords = this.categories[category].map(k => this._normalize(k));
                    if (normalizedKeywords.includes(cleanWord)) {
                        analysisResult[category].contador++;
                        analysisResult[category].palabras.push(word.replace(/[.,¡!¿?]/g, '')); // Guardar la palabra original
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
