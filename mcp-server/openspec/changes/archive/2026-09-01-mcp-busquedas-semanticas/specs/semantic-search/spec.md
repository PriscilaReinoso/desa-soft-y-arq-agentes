## Purpose

Permite al agente de IA buscar artículos de la ferretería por significado mediante embeddings vectoriales, devolviendo resultados relevantes incluso cuando la consulta no coincide literalmente con el texto del catálogo.

## ADDED Requirements

### Requirement: Búsqueda semántica de artículos
El servidor MCP MUST ofrecer la herramienta `semantic_search` que reciba una consulta en lenguaje natural y devuelva los artículos del catálogo más relevantes por similitud de sus embeddings vectoriales, ordenados por similitud descendente.

#### Scenario: Búsqueda exitosa por significado
- **WHEN** el cliente invoca `semantic_search` con la consulta "herramienta para clavar"
- **THEN** el sistema devuelve una lista de artículos ordenados por similitud semántica que incluye martillos y clavadoras, junto con su nombre, descripción, categoría, medida y un score de similitud.

#### Scenario: Búsqueda sin resultados
- **WHEN** el cliente invoca `semantic_search` con una consulta que no guarda relación con ningún artículo del catálogo
- **THEN** el sistema devuelve un estado de éxito con una lista vacía y un mensaje indicando que no se encontraron coincidencias.

#### Scenario: Límite de resultados
- **WHEN** el cliente invoca `semantic_search` con una consulta y un parámetro `limit`
- **THEN** el sistema devuelve como máximo `limit` artículos, ordenados por similitud descendente.

### Requirement: Consulta en lenguaje natural
El servidor MCP MUST aceptar consultas arbitrarias en lenguaje natural, sin requerir coincidencia textual literal con el nombre o descripción de los artículos.

#### Scenario: Coincidencia por sinónimo o concepto
- **WHEN** el cliente consulta "artículo para pintar superficies"
- **THEN** el sistema devuelve pinceles, rodillos y brochas aunque el término "pintar" no aparezca literalmente en su nombre o descripción.

### Requirement: Embeds dentro del límite del modelo
El texto enriquecido de cada artículo que se vectoriza MUST permanecer dentro del límite de tokens del modelo de embeddings utilizado, garantizando que la generación del vector no se trunque.

#### Scenario: Síntesis de texto enriquecido
- **WHEN** se genera el embedding de un artículo con nombre, descripción, categoría y medida
- **THEN** el texto resultante no excede el límite de tokens del modelo y su vector representa al artículo completo.
