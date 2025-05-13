<h1 align="center" id="title">Billetera Virtual - Análisis y Diseño de Sistemas</h1>

<p id="description">Este repositorio contiene todo el proceso de desarrollo de una billetera virtual abarcando desde la etapa de investigación inicial hasta el diseño y la implementación de la aplicación. El objetivo del proyecto es ofrecer una solución segura intuitiva y funcional para la gestión digital de dinero.</p>

Este proyecto pertenece a la materia Análisis y Diseño de Sistemas (2025) de la <a href="https://www.unrc.edu.ar">Universidad Nacional de Río Cuarto</a>.

<h2>🚀 Cómo iniciar el proyecto localmente</h2>

🛠️ Requisitos previos
Asegúrate de tener instalado en tu máquina:
* <a href="https://www.docker.com/get-started/">Docker</a>

Sigue estos pasos para levantar la aplicación en tu entorno local usando Docker:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/billetera-virtual.git
   cd billetera-virtual
2. **Construye y levanta los servicios**
   ```bash
   docker compose build
   ```
   ```bash
   docker compose up app
   ```
3. **Crea la base de datos**
   ```bash
   docker compose exec app bundle exec rake db:create
   ```

El servicio estará inicializado en http://localhost:8000

Para acceder a la consola interactiva de Ruby y probar lógica:
```bash
docker compose exec app bundle exec irb -I. -r server.rb
```


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

  
<h2>💻 Built with</h2>

Lenguajes utilizados:

*   Ruby - Backend

Tecnologías utilizadas:

*   Sinatra - Framework web minimalista
*   SQLite3 – Base de datos
*   ActiveRecord – ORM para gestionar interacciones con la base de datos
*   Docker – Contenerización de la aplicación
