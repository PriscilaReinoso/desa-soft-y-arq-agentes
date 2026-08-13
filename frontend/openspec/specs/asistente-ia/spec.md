# Asistente IA Specification

## Purpose

Proporciona un chat con un asistente inteligente sobre el inventario, con sugerencias rápidas y respuestas simuladas en esta base inicial.

## Requirements

### Requirement: Encabezado y sugerencias rápidas
El sistema SHALL mostrar el encabezado del asistente con su estado "En línea" y una fila de sugerencias que, al hacer clic, envían la pregunta como mensaje del usuario.

#### Scenario: Envío mediante sugerencia
- **WHEN** el usuario hace clic en una sugerencia
- **THEN** el sistema agrega la pregunta como mensaje del usuario y genera la respuesta del asistente

### Requirement: Conversación por mensajes
El sistema SHALL mostrar los mensajes del usuario alineados a la derecha con el color primario y los del asistente alineados a la izquierda como tarjetas blancas, con el texto en negrita resaltado. Mientras se genera una respuesta SHALL mostrar un indicador de escritura.

#### Scenario: Mensajes diferenciados
- **WHEN** se muestran mensajes de usuario y asistente
- **THEN** cada uno se distingue por alineación, fondo y forma según su rol

#### Scenario: Indicador de escritura
- **WHEN** el asistente está generando una respuesta
- **THEN** el sistema muestra el indicador de escritura hasta completar la respuesta

### Requirement: Entrada de mensaje
El sistema SHALL ofrecer un campo de entrada con botón "Enviar"; la tecla Enter envía el mensaje, el botón se deshabilita cuando el campo está vacío o hay una respuesta en curso, y la conversación se desplaza automáticamente al último mensaje.

#### Scenario: Envío por tecla Enter
- **WHEN** el usuario presiona Enter en el campo de entrada
- **THEN** el sistema envía el mensaje y vacía el campo

#### Scenario: Botón deshabilitado
- **WHEN** el campo de entrada está vacío o hay una respuesta en curso
- **THEN** el botón Enviar se muestra deshabilitado
