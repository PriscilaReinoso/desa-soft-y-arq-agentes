## MODIFIED Requirements

### Requirement: Encabezado y alta de depósito
El sistema SHALL mostrar el título, la cantidad de depósitos registrados (obtenida de la API) y un botón "+ Nuevo depósito" que despliega un modal con los campos nombre, descripción y dirección. Al confirmar, el sistema SHALL enviar `POST /api/v1/depositos` y, ante el éxito, refrescar el listado con el nuevo depósito.

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de depósitos
- **THEN** el sistema muestra el título, la cantidad de depósitos cargada desde la API y el botón de alta

#### Scenario: Alta de depósito exitosa
- **WHEN** el usuario completa el modal con nombre válido y confirma
- **THEN** el sistema envía `POST /api/v1/depositos` y actualiza el listado con el depósito creado

#### Scenario: Cancelar el alta
- **WHEN** el usuario abre el modal de alta y hace clic en Cancelar
- **THEN** el sistema cierra el modal sin enviar ninguna solicitud

### Requirement: Tarjetas de depósito
El sistema SHALL mostrar los depósitos cargados desde la API en una grilla de dos columnas, cada uno con nombre, descripción, dirección y la cantidad de espacios en tipografía monoespaciada, más la acción "Editar" que despliega un modal precargado con los datos del depósito. Al confirmar, el sistema SHALL enviar `PUT /api/v1/depositos/{id}` y refrescar el listado.

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
- **WHEN** la API responde con un error al listar, crear o editar un depósito
- **THEN** el sistema muestra un mensaje de error con el detalle de la respuesta
