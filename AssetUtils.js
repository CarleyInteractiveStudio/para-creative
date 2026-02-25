// Archivo: Assets/Scripts/ControladorJugador.ces

// Definimos la velocidad constante hacia adelante y la fuerza de salto
variable velocidadHorizontal = 5.0; // Velocidad con la que el jugador avanza
variable fuerzaSalto = 10.0;    // Fuerza aplicada al saltar

// Una bandera para saber si el jugador puede saltar (está en el suelo)
variable puedeSaltar = verdadero;

// Esta función se ejecuta una vez al inicio del objeto
alEmpezar() {
    // Configuramos la gravedad del Rigidbody2D para que el jugador caiga más rápido
    fisica.gravedadEscala = 3.0;
    // Congelamos la rotación en el eje Z para que el jugador no gire al colisionar
    fisica.congelarRotacionZ = verdadero;
}

// Esta función se ejecuta en cada fotograma del juego
alActualizar() {
    // Mantenemos una velocidad horizontal constante para el jugador
    // Accedemos a 'fisica' (Rigidbody2D) directamente
    fisica.velocidad.x = velocidadHorizontal;

    // Verificamos si la tecla "Espacio" está presionada y si el jugador puede saltar
    si (Input.estaPresionado("Espacio") y puedeSaltar) {
        // Si es así, aplicamos una fuerza vertical para el salto
        fisica.velocidad.y = fuerzaSalto;
        // Desactivamos 'puedeSaltar' para evitar saltos dobles en el aire
        puedeSaltar = falso;
    }
}

// Esta función se llama cuando el objeto entra en colisión física con otro
alEntrarEnColision(otro) {
    // Simplificaremos: Si colisiona con cualquier cosa, asumimos que puede volver a saltar.
    // En un juego más complejo, verificaríamos si es el "suelo" y la dirección de la colisión.
    puedeSaltar = verdadero;
}
