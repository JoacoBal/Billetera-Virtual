<h1 align="center" id="title">Billetera Virtual - Análisis y Diseño de Sistemas</h1>

<p id="description">Este repositorio contiene todo el proceso de desarrollo de una billetera virtual abarcando desde la etapa de investigación inicial hasta el diseño y la implementación de la aplicación. El objetivo del proyecto es ofrecer una solución segura intuitiva y funcional para la gestión digital de dinero.</p>

Este proyecto pertenece a la materia Análisis y Diseño de Sistemas (2025) de la <a href="https://www.unrc.edu.ar">Universidad Nacional de Río Cuarto</a>.

<h2> Current state </h2>
A través de este enlace se podrá acceder a las funcionalidades con las que cuenta el sistema, viene dado por un breve resumen.

<a href="docs/resume_1.md"> Estado del sistema </a>
<h2>🚀 Cómo iniciar el proyecto localmente</h2>

🛠️ Requisitos previos
Asegúrate de tener instalado en tu máquina:
* <a href="https://www.docker.com/get-started/">Docker</a>
* <a href="https://nodejs.org/en"> Nodejs </a>

Sigue estos pasos para levantar la aplicación en tu entorno local:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/JoacoBal/Billetera-Virtual.git
   cd billetera-virtual

API:

2. **Construye y levanta los servicios**
   ```bash
   docker compose build
   ```
   ```bash
   docker compose up
   ```
3. **Crea la base de datos** ¡CUIDADO! (leer abajo)
   ```bash
   docker compose exec api bundle exec rake db:create
   ```
IMPORTANTE: Solo crear la base de datos en caso de que no este ya creada, en ese caso incluso se podría hacer que este comando sea más completo e incluya todas las tareas:
```bash
docker compose exec api bundle exec rake db:drop db:create db:migrate
```
Sólo sería útil la primera vez que se inicializa la app, ya que resetea la base de datos, primero la borra, luego la vuelve a crear y por último ejecuta las migraciones.

El servicio estará inicializado en http://localhost:8000 (o cualquier dirección ipv4, esto para facilitar la presentación del proyecto en clase)

Para acceder a la consola interactiva de Ruby y probar lógica:
```bash
docker compose exec api bundle exec irb -I. -r server.rb
```

Servidor WEB:

2. **Iniciar entorno de desarrollo**
   ```bash
   npm i
   npm run dev

La instrucción 'npm i' se encargará de instalar las dependencias necesarias para frontend, la instrucción 'npm run dev' ejecutará el servidor en el entorno de desarrollo

El servicio estará inicializado en http://localhost:5173 (o cualquier dirección ipv4, esto para facilitar la presentación del proyecto en clase)

El Frontend no está dockerizado.
<h2>📖 Documentation </h2>

 El repositorio cuenta con información de cada una de las etapas:

*  <a href="docs/ideas.md">Lluvia de ideas (etapa inicial)</a>
*  <a href="docs/Billetera virtual - HistoryUsers.pdf">Historias de usuario</a>
*  <a href="docs/Billetera virtual - Proyecto AyDS 2025.pdf">Especificación (Documento SRS)</a>
*  <a href="docs/diagrama_uml.svg">Diagrama de clase UML</a> 
<h2>🧐 Features</h2>

Algunas de las funcionalidades del proyecto:

*   Autenticación y gestión de usuarios
*   Gestión de cajas de ahorro personales
*   Cajas de ahorro compartidas

<h2>🗺️ Roadmap </h2>
 
 Para ver el roadmap y en qué feature se está trabajando:
<a href="https://github.com/JoacoBal/Billetera-Virtual/projects?query=is%3Aopen"> Projects </a>
  
<h2>💻 Built with</h2>

Lenguajes utilizados:

*   Ruby - Backend
*   JavaScript / TypeScript – Frontend

Tecnologías utilizadas:

*   Sinatra - Framework web minimalista
*   SQLite3 – Base de datos
*   ActiveRecord – ORM para gestionar interacciones con la base de datos
*   Docker – Contenerización de la aplicación

**Frontend:**

* React – Librería para construir interfaces de usuario
* TypeScript – Superset de JavaScript tipado
* Vite – Herramienta de desarrollo y build rápida
* Tailwind CSS – Framework de estilos utilitario
* ShadCN UI – Componentes accesibles y elegantes basados en Radix UI
* Axios – Cliente HTTP para llamadas a la API
* TanStack Table (React Table) – Manejo avanzado de tablas (paginación, filtros, sorting)
