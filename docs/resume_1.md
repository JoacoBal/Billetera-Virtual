# Resumen de funcionalidades implementadas hasta la fecha

Este documento resume las funcionalidades desarrolladas hasta el momento en el sistema, con el objetivo de facilitar el seguimiento por parte del profesor a cargo de la corrección.

---

## 1. Autenticación de usuarios

- **Registro de cuenta:** El sistema permite la creación de cuentas de usuario con sus respectivas validaciones. Por el momento, no se ha implementado la confirmación de correo electrónico.
- **Inicio de sesión:** Los usuarios pueden iniciar sesión siempre que la cuenta exista. Al hacerlo, se genera un token JWT que se adjunta automáticamente en el encabezado de cada solicitud HTTP, brindando así una capa de seguridad para el acceso a la API.

> Se utilizó **JWT (JSON Web Token)** como método de autenticación por su facilidad de implementación y porque no requiere almacenar sesiones en la base de datos.

---

## 2. Creación de cajas

- Existe un endpoint funcional para la creación de cajas, aunque aún no está conectado al frontend.
- Al momento de crear una cuenta, se genera automáticamente una **caja principal**, única por usuario.
- El backend gestiona automáticamente las relaciones correspondientes al crear una caja, como por ejemplo con la tabla `Wallet_Members`, que define qué usuarios tienen acceso a qué cajas.

---

## 3. Transferencias

- La funcionalidad de transferencias está operativa. Por ahora, solo se permite realizar transferencias entre dos CVUs.
- Se incluyen validaciones para asegurar la integridad de los datos, y se utiliza una transacción para garantizar la consistencia en caso de error en alguno de los pasos del proceso.
- Las transferencias están asociadas a **cajas**, no directamente a usuarios. La relación usuario → transferencia se da a través de:  
  **usuario → caja → transferencia**.

---

## 4. Historial de transferencias

- Es posible consultar el historial de transferencias de un usuario, tanto enviadas como recibidas.
- Esto se logra gracias a la relación entre usuarios y las "cajas disponibles": son consideradas "disponibles" las cajas en las que el usuario participa, ya sea como propietario o como invitado.
- Esta estructura fue diseñada pensando en una futura implementación de **cajas compartidas**.
