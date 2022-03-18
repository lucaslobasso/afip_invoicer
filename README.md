<br/>
<!-- Logo & Title-->
<div align="center">
  <img src="https://github.com/lucaslobasso/afip_invoicer/blob/master/assets/icon.png" width="200">
  
  # Croessant
</div>


<!-- Description -->
<p align="center">
  ¡La forma más rápida y facíl de generar tus facturas!
  <br/>
  <a href="https://github.com/lucaslobasso/afip_invoicer/releases"><strong>Haga click aquí para descargar</strong></a>
  <br/>
  <br/>
  <a href="https://github.com/lucaslobasso/afip_invoicer/issues">Reportar un bug</a>
  ·
  <a href="https://github.com/lucaslobasso/afip_invoicer/issues">Pedir un feature</a>
</p>

<!-- Shields -->
<div align="center">
  
  ![GitHub release (latest by date)](https://img.shields.io/github/v/release/lucaslobasso/afip_invoicer)
  ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/lucaslobasso/afip_invoicer/Release)
  ![GitHub issues](https://img.shields.io/github/issues/lucaslobasso/afip_invoicer)
  ![GitHub contributors](https://img.shields.io/github/contributors-anon/lucaslobasso/afip_invoicer)
  ![GitHub forks](https://img.shields.io/github/forks/lucaslobasso/afip_invoicer?style=social)
</div>
<div align="center">
  
  ![GitHub all releases](https://img.shields.io/github/downloads/lucaslobasso/afip_invoicer/total)
  ![GitHub Release Date](https://img.shields.io/github/release-date/lucaslobasso/afip_invoicer)
  ![GitHub](https://img.shields.io/github/license/lucaslobasso/afip_invoicer?color=4884c9)
</div>

<!-- Table of contents -->
<details open="open">
  <summary>Tabla de contenidos</summary>
  <ol>
    <li><a href="#acerca-del-proyecto">Acerca del proyecto</a></li>
    <li><a href="#guía-de-inicio">Guía de inicio</a></li>
    <li><a href="#como-usarlo">Como usarlo</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contribuciónes">Contribuciónes</a></li>
    <li><a href="#licencia">Licencia</a></li>
    <li><a href="#contacto">Contacto</a></li>
  </ol>
</details>

<!-- About -->
## Acerca del proyecto

<strong>Croessant</strong> es una simple aplicación de escritorio para generar y ver tus Facturas C de la Administración Federal de Ingresos Públicos (AFIP) de la manera más rápida y sencilla posible.

Fue creada con la intención de simplificar al máximo el proceso de generación de facturas para los monotributistas de la Argentina.

Además, corre en Linux, macOS y Windows.

<!-- Getting started -->
## Guía de inicio

Deberás generar los `Certificados Digitales para Utilización con Webservices AFIP` (para producción) desde la página de la AFIP. Esto te dará un <strong>cert</strong> y una <strong>key</strong> necesarios para el functionamiento de la aplicación.

Ir a http://www.afip.gob.ar/ws/documentacion/certificados.asp para obtener mas información de como generar la clave y certificado

<!-- Usage -->
## Como usarlo

Primero debes cargar tu CUIT/CUIL y los certificados de la AFIP generados en la `Guía de inicio` en la pantalla de `Configuración` que aparecerá apenas abras la aplicación.

Luego podrás generar tu primer factura tipo C desde la pantalla de `Generación de comprobantes`. Solo tenés que elegir el <strong>concepto</strong>, el <strong>punto de venta</strong> (de tener varios), la <strong>fecha</strong> y finalmente el <strong>monto</strong>.

<strong>Croessant</strong> se encarga automáticamente de darte a elegir dentro de un rango válido de fechas y de validar los montos mínimos y máximos permitidos para una factura del tipo C.

También, podes ver tus comprobantes dentro de un rango de fechas desde la pantalla de <strong>Consulta de comprobantes</strong>.
  
<br/>
<div align="center">
  <img src="https://github.com/lucaslobasso/afip_invoicer/blob/master/assets/screenshots/Configuracion_inicial.png" width="300">
  <img src="https://github.com/lucaslobasso/afip_invoicer/blob/master/assets/screenshots/Generacion_de_comprobantes.png" width="300">
  <img src="https://github.com/lucaslobasso/afip_invoicer/blob/master/assets/screenshots/Consulta_de_comprobantes.png" width="300">
</div>


<!-- Readmap -->
## Roadmap

Mirá los [open issues](https://github.com/lucaslobasso/afip_invoicer/issues) para el listado de los features propuestos (e issues conocidos).


<!-- Contributing -->
## Contribuciónes

Las contribuciones son lo que hace que la comunidad de código abierto sea un lugar increíble para aprender, inspirar y crear. Cualquier contribución que hagas es **muy apreciada**.

1. Forkea el proyecto.
2. Crea tu branch (`git checkout -b feature/AmazingFeature`).
3. Commitea tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Pushea los commits a tu branch (`git push origin feature/AmazingFeature`).
5. Generá un `Pull Request`.


<!-- License -->
## Licencia

Distribuido bajo la MIT License. Leer `LICENSE` para mas información.


<!-- Contact -->
## Contacto

Lucas Damián Lobasso - lobassolucas@gmail.com

Link del proyecto: [https://github.com/lucaslobasso/afip_invoicer](https://github.com/lucaslobasso/afip_invoicer)
