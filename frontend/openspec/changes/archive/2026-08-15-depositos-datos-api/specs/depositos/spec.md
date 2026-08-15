## MODIFIED Requirements

### Requirement: Encabezado y alta de depósito
El sistema SHALL mostrar el título, la cantidad de depósitos registrados (obtenida de la API) y un botón "+ Nuevo depósito" que despliega un modal con los campos nombre, descripción y dirección y una sección "Espacios" para cargar espacios nuevos (tipo, descripción, filas y columnas). Al confirmar, el sistema SHALL enviar `POST /api/v1/depositos` y, ante el éxito, crear cada espacio cargado con `POST /api/v1/espacios` y refrescar el listado con el nuevo depósito.

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de depósitos
- **THEN** el sistema muestra el título, la cantidad de depósitos cargada desde la API y el botón de alta

#### Scenario: Alta de depósito exitosa
- **WHEN** el usuario completa el modal con nombre válido y confirma
- **THEN** el sistema envía `POST /api/v1/depositos` y actualiza el listado con el depósito creado

#### Scenario: Alta de depósito con espacios
- **WHEN** el usuario completa el modal con nombre válido, carga uno o más espacios (tipo, descripción, filas y columnas) y confirma
- **THEN** el sistema crea el depósito, crea cada espacio cargado con `POST /api/v1/espacios` asociado al depósito y actualiza el listado

#### Scenario: Cancelar el alta
- **WHEN** el usuario abre el modal de alta y hace clic en Cancelar
- **THEN** el sistema cierra el modal sin enviar ninguna solicitud

### Requirement: Tarjetas de depósito
El sistema SHALL mostrar los depósitos cargados desde la API en una grilla de dos columnas, cada uno con nombre, descripción, dirección y la cantidad de espacios en tipografía monoespaciada, más la acción "Editar" que despliega un modal precargado con los datos del depósito y sus espacios existentes. Al confirmar, el sistema SHALL enviar `PUT /api/v1/depositos/{id}`, aplicar los cambios sobre los espacios y refrescar el listado.

#### Scenario: Datos reales en la tarjeta
- **WHEN** el usuario abre la sección de depósitos
- **THEN** cada tarjeta muestra nombre, descripción, dirección y cantidad de espacios del depósito real

#### Scenario: Edición exitosa
- **WHEN** el usuario modifica los datos en el modal de edición y confirma
- **THEN** el sistema envía `PUT /api/v1/depositos/{id}` y actualiza la tarjeta con los datos modificados

#### Scenario: Cancelar la edición
- **WHEN** el usuario abre el modal de edición y hace clic en Cancelar
- **THEN** el sistema cierra el modal sin enviar ninguna solicitud

#### Scenario: Error de la API
- **WHEN** la API responde con un error al listar, crear o editar un depósito o sus espacios
- **THEN** el sistema muestra un mensaje de error con el detalle de la respuesta

## ADDED Requirements

### Requirement: Gestión de espacios en la edición
El sistema SHALL mostrar en el modal de edición la lista de espacios existentes del depósito, obtenida de `GET /api/v1/depositos/{id}`, cada uno con sus campos editables (tipo, descripción, filas y columnas) y una acción para quitarlo de la lista. El sistema SHALL permitir agregar espacios nuevos y, al confirmar, enviar `PUT /api/v1/espacios/{id}` por cada espacio modificado, `DELETE /api/v1/espacios/{id}` por cada espacio quitado y `POST /api/v1/espacios` por cada espacio nuevo, refrescando el listado al final.

#### Scenario: Listado de espacios en la edición
- **WHEN** el usuario abre el modal de edición de un depósito con espacios
- **THEN** el sistema muestra cada espacio existente con tipo, descripción, filas y columnas cargadas de `GET /api/v1/depositos/{id}`

#### Scenario: Modificar un espacio existente
- **WHEN** el usuario cambia algún campo de un espacio existente y confirma
- **THEN** el sistema envía `PUT /api/v1/espacios/{id}` con los nuevos valores

#### Scenario: Quitar un espacio existente
- **WHEN** el usuario quita un espacio existente de la lista y confirma
- **THEN** el sistema envía `DELETE /api/v1/espacios/{id}` para ese espacio

#### Scenario: Agregar un espacio en la edición
- **WHEN** el usuario agrega una fila nueva en el modal de edición y confirma
- **THEN** el sistema envía `POST /api/v1/espacios` asociando el espacio al depósito editado

#### Scenario: Error de la API
- **WHEN** la API responde con un error al listar, crear, modificar o eliminar un espacio
- **THEN** el sistema muestra un mensaje de error con el detalle de la respuesta
