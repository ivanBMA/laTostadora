//------------Posiblemente realizar login
//Bucle de longitud de elementos a insertar       
//Abrir Gestion diseños
//Presionar boton Añadir Diseño
//Subir archivo aceptar check box y Darle al boton submit
//Añadimos tags en intervalos de X segundos y presionar boton crear articulo
//Pulsar boton de cerrar

//Carpeta Imagenes y archivo tags con el mismo nombre base
//Tags de 1 en 1 y enters

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const { timeout } = require('puppeteer');

//Esto lee todos los archivos de la carpeta img
function leerArchivos() {
    const fs = require('fs');
    const path = require('path');
    const carpeta = './img';

    return new Promise((resolve, reject) => {
        fs.readdir(carpeta, (err, archivos) => {
            if (err) {
                console.error('Error al leer la carpeta:', err);
                return reject(err); // En caso de error, rechazamos la promesa
            }

            // Listar los nombres de los archivos
            archivos.forEach(archivo => {
                console.log(archivo);
            });

            resolve(archivos); // Resolviendo la promesa con los archivos
        });
    });
}

function obtenerDescripcion(nombreFoto) {
    const fs = require('fs');

    const nombreArchivo = "Sunset_by_the_Beach.png";

    // Usamos replace() para eliminar la extensión .png
    const nombreSinExtension = nombreFoto.replace('.png', '');

    // Lee el archivo JSON de forma síncrona (puedes cambiarlo a asíncrono si prefieres)
    const data = fs.readFileSync('photo_descriptions.json', 'utf8');

    // Convierte el contenido del archivo JSON a un objeto de JavaScript
    const fotos = JSON.parse(data);

    // Busca la foto por su nombre y retorna la descripción
    const foto = fotos.find(f => f.photo_name === nombreSinExtension);

    if (foto) {
        console.log(`Descripción de ${nombreSinExtension}:`, foto.description);
        return foto.description;
    } else {
        console.log(`La foto con el nombre ${nombreSinExtension} no se encontró.`);
        return null;
    }
}

async function login(page) {
    // Esperar y hacer clic en el botón "OK"
    await page.waitForSelector('#onetrust-accept-btn-handler');
    await page.click('#onetrust-accept-btn-handler');

    // Esperar a que el botón "Añadir diseño" esté disponible y hacer clic
    //await page.waitForSelector('a[onclick="javascript:show_subir_diseno_digit();"]');
    //await page.click('a[onclick="javascript:show_subir_diseno_digit();"]');

    // Esperar a que aparezcan los campos de email y contraseña
    await page.waitForSelector('#user-email_page'); // Cambia esto si el ID es diferente
    await page.waitForSelector('#user-password_page'); // Cambia esto si el ID es diferente

    // Completar el formulario
    const email = 'ivanmprp@gmail.com'; // Reemplaza con tu email
    const password = 'Leopardo1.'; // Reemplaza con tu contraseña
    await page.type('#user-email_page', email);
    await page.type('#user-password_page', password);

    // Esperar a que el botón "Iniciar sesión" esté disponible
    const loginButtonSelector = 'button.a-button-accent.--large.margin-center';
    await page.waitForSelector(loginButtonSelector, { visible: true });

    // Verificar si el botón está habilitado antes de hacer clic
    const isEnabled = await page.evaluate(selector => {
        const button = document.querySelector(selector);
        return button && !button.disabled; // Comprobar que el botón no está deshabilitado
    }, loginButtonSelector);

    if (isEnabled) {
        console.log("Esperando 5 segundos antes de hacer clic en el botón 'Iniciar sesión'");
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 0.5 segundos
        await page.click(loginButtonSelector);
    } else {
        console.error("El botón 'Iniciar sesión' está deshabilitado o no es visible.");
    }

    console.log("Login Echo");
}

async function seleccionarTienda(page) {
    // Selecciona la opción que contiene el texto "personalcomputer"
    await page.evaluate(() => {
        const options = document.querySelectorAll('#shop_selector option');
        for (let option of options) {
            if (option.textContent.includes('personalcomputer')) {
                option.selected = true; // Marca esta opción como seleccionada
                break; // Detiene el bucle una vez que se encuentra
            }
        }
        // Simula el evento "change" en el select para que el cambio sea detectado
        document.querySelector('#shop_selector').dispatchEvent(new Event('change'));
    });
    await delay(2000);
}

async function paso1(page, path, nombreImg) {
    console.log("Empieza paso 1");
    // Hacer clic en el enlace "Gestión de diseños"

    // Esperar 0.5 segundo antes de redireccionar
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.goto('https://www.latostadora.com/portafolio_disenos.php');

    await seleccionarTienda(page);

    // Esperar 0.5 segundo antes de clicar el boton de Añadir artículo
    await page.waitForSelector('.botones-2.botones-2-small', { timeout: 3000 });
    await page.click('.botones-2.botones-2-small');

    // Subir la imagen
    const imagePath = await path.resolve('./img/' + nombreImg); // Cambia esta ruta a la ubicación de tu imagen <---
    await page.waitForSelector('#image_to_upload');
    const fileInput = await page.$('#image_to_upload');
    await fileInput.uploadFile(imagePath); // Subir la imagen

    // Seleccionar el checkbox
    await page.waitForSelector('#acepto_tos');
    await page.click('#acepto_tos'); // Marcar el checkbox

    // Hacer clic en el botón "Subir"
    await page.waitForSelector('input[value="Subir"]', { timeout: 3000 });
    await page.click('input[value="Subir"]');

    console.log("Termina paso 1");

}

async function recogerNumero(page) {
    return new Promise((resolve, reject) => {
        let result = 0;

        const intervalId = setInterval(async () => {
            try {
                // Obtener los valores de todos los inputs
                const values = await page.$$eval('.editName.disenos.designs.input', inputs => inputs.map(input => input.value));

                // Mostrar los valores en la consola
                console.log(values);

                const highestDesign = values
                    .map(design => parseInt(design.replace(/\D/g, ''), 10)) // Extraer los números
                    .filter(number => !isNaN(number)) // Filtrar valores que no son números (NaN)
                    .reduce((max, current) => Math.max(max, current), 0); // Obtener el número más alto

                // Mostrar el diseño correspondiente
                result = `Diseño ${highestDesign}`;
                console.log(result);
                console.log("paso 2");

                // Condición para dejar de ejecutar el intervalo
                if (highestDesign !== 0) {
                    console.log("Encontrado el número, ya no se ejecutará la lógica");
                    clearInterval(intervalId);
                    resolve(highestDesign); // Resolviendo la promesa con el valor encontrado
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(error); // Rechazar la promesa si hay un error
            }
        }, 1000);
    });
}


async function paso2(page, descripcciones, nombreImg) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Reemplazar setTimeout con un await

    // Esperar a que todos los inputs estén disponibles
    await page.waitForSelector('.editName.disenos.designs.input', { timeout: 30000 });

    var highestDesign = await recogerNumero(page);

    //<--x
    // Verifica si highestDesign tiene el valor correcto
    console.log('highestDesign:', highestDesign);

    // Espera que el elemento exista
    await page.waitForSelector('#in' + highestDesign);

    // Enfoca el campo
    await page.focus('#in' + highestDesign);

    // Verifica si existe el input con el sufijo '_tag'
    const inputSelector = '#in' + highestDesign;
    console.log('Selector para tag:', inputSelector);

    await page.click(inputSelector, { clickCount: 3 }); // Selecciona todo el texto en el input
    await page.keyboard.press('Backspace'); // Borra el texto seleccionado

    var nombreSinExtension = nombreImg.replace('.png', '');
    var nombreSinBarraBajas = nombreSinExtension.replace(/_+/g, ' ');
    await page.type(inputSelector, nombreSinBarraBajas);

    // Haz click en la imagen con el sufijo '_img'
    const imgSelector = '#in' + highestDesign + '_img';
    console.log('Selector para img:', imgSelector);
    await page.click(imgSelector);
    //<-------------------------------------------x


    // Esperar a que el input esté disponible
    await page.waitForSelector('#tags-' + highestDesign + '_tag');


    for (const descripccion of descripcciones) {
        console.log("Descripcion " + descripccion + " \n");

        // Enfocar el input
        await page.focus('#tags-' + highestDesign + '_tag');

        // Escribir el tag
        await page.type('#tags-' + highestDesign + '_tag', descripccion);

        // Presionar Enter para añadir el tag
        await page.keyboard.press('Enter');
    }

    console.log("paso 2 casi acaba");
    await page.click('.botones-2.botones-2-small', { timeout: 50000 });
    console.log("paso 2 acaba");
}

async function main() {
    const puppeteer = require('puppeteer');
    const path = require('path');

    (async () => {
        const browser = await puppeteer.launch({ headless: false }); // Para ver el navegador
        const page = await browser.newPage();

        // Navegar a la página
        await page.goto('https://www.latostadora.com/portafolio_disenos.php');

        await login(page);
        leerArchivos().then(async ARCHIVOS => {
            console.log("Numero de archivos: " + ARCHIVOS.length);

            

            for (const archivo of ARCHIVOS) {
                // Repetir tantas veces como imagenes en la carpeta y sacar nombre de archivo y tags
                console.log("Bucle Archivo = " + archivo);
                const descripcciones = await obtenerDescripcion(archivo);
                console.log("Descripción : " + descripcciones);

                //await seleccionarTienda(page, { timeout: 60000 });

                await paso1(page, path, archivo);
                delay(15000);
                await paso2(page, descripcciones, archivo);
                delay(2000);
            }

            console.log("||||||||||||||||||||||||||||- Todo Acabo Correctamente -|||||||||||||||||||||||||||||||||||||||");
        });

    })();
}


//Ejecucion Del programa
main();
