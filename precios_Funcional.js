const { time } = require('console');
const { timeout } = require('puppeteer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let contador = 0;

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
    const email = '************'; // Reemplaza con tu email
    const password = '************'; // Reemplaza con tu contraseña
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
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 0.5 segundos
        await page.click(loginButtonSelector);
    } else {
        console.error("El botón 'Iniciar sesión' está deshabilitado o no es visible.");
    }

    console.log("Login Echo");
}

// Función para hacer scroll hasta el final de la página

// Función para hacer scroll hasta el final de la página
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 9000;
            const timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 1000); // Ajusta el intervalo según la velocidad de carga de la página
        });
    });
}

async function numeroPaginas(page) {
    // Continuar con la paginación si es necesario
    let hasMorePages = true;
    let numeroMax = 0;

    while (hasMorePages) {
        // Ejecutar el scroll hasta el final de la página
        await autoScroll(page);
        // Esperar a que el elemento ul.pagination esté presente
        await page.waitForSelector('ul.pagination');

        // Extraer los valores de los <a> dentro de la paginación
        const paginationLinks = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('ul.pagination li a').forEach(link => {
            links.push(link.innerText); // Solo almacenar el texto
            });
            return links;
        });

        /// Convertir los textos a números y encontrar el máximo
        const numbers = await paginationLinks.map(Number); // Convertir textos a números
        const maxNumber = await Math.max(...numbers); // Obtener el número máximo

        console.log(`Los números extraídos son: ${numbers}`);
        console.log(`El número más grande es: ${maxNumber}`);

        console.log(paginationLinks);
        await page.goto('https://www.latostadora.com/mis_articulos.php?p=' + maxNumber + '&s=0');

        if (numeroMax == maxNumber) {
            hasMorePages = false;
            break;
        }
        if (numeroMax < maxNumber) {
            numeroMax = maxNumber;
            hasMorePages = true;
        }
    }

    console.log("Acabo All Ids El numero es " + numeroMax)
    return numeroMax;
}


async function tamañoVentana(page) {

    // Maximizar la ventana
    const [width, height] = [1200, 1200]; // Cambia a la resolución deseada
    await page.setViewport({ width, height });
    await page.evaluate(() => {
        // Establecer zoom en el cuerpo
        document.body.style.zoom = '100%'; // Cambia el porcentaje según sea necesario
    });
}
/*
async function sacarIdArticulos(page) {
     // Esperar a que el div esté disponible en la página
    await page.waitForSelector('#lista_articulos_tienda');

    // Extraer los IDs de los elementos dentro de div#lista_articulos_tienda
    const vectorIds = await page.evaluate(() => {
        const contenedor = document.getElementById('lista_articulos_tienda');

        // Comprobar si el contenedor existe
        if (!contenedor) return []; // Retorna un array vacío si no existe

        const ids = [];
        const elementos = contenedor.querySelectorAll('*'); // Selecciona todos los elementos hijos

        // Expresión regular para filtrar IDs que comienzan con 'div_articulo_' seguido de números
        const regex = /^div_articulo_\d+$/;

        elementos.forEach(element => {
            const id = element.id; // Obtener el ID del elemento
            if (id && regex.test(id)) { // Verificar si el elemento tiene un ID y coincide con la expresión regular
                ids.push(id); // Agregar el ID al array
            }
        });

    });

    // Mostrar los resultados en la consola
    console.log("vectorIds " + vectorIds);
    return vectorIds; // Retornar el array de IDs que coinciden
    
}*/
async function sacarIdArticulos(page) {
    // Esperar a que el div esté disponible en la página
    await page.waitForSelector('#lista_articulos_tienda');

    // Extraer los IDs de los elementos dentro de div#lista_articulos_tienda
    const vectorIds = await page.evaluate(() => {
        const contenedor = document.getElementById('lista_articulos_tienda');

        // Comprobar si el contenedor existe
        if (!contenedor) return []; // Retorna un array vacío si no existe

        const ids = [];
        const elementos = contenedor.querySelectorAll('*'); // Selecciona todos los elementos hijos

        // Expresión regular para filtrar IDs que comienzan con 'div_articulo_' seguido de números
        const regex = /^div_articulo_\d+$/;

        elementos.forEach(element => {
            const id = element.id; // Obtener el ID del elemento
            if (id && regex.test(id)) { // Verificar si el elemento tiene un ID y coincide con la expresión regular
                ids.push(id); // Agregar el ID al array
            }
        });

        return ids; // Asegúrate de retornar el array aquí
    });

    // Mostrar los resultados en la consola
    console.log("vectorIds:", vectorIds);
    return vectorIds; // Retornar el array de IDs que coinciden
}


async function cambiarPrecio(page, idArticulo) {
   // Esperar a que el div del artículo esté disponible en la página
   await page.waitForSelector(`#${idArticulo}`);

   // Modificar el precio del artículo correspondiente
   const nuevoPrecio = await page.evaluate(id => {
       // Seleccionar el campo de precio usando el ID del artículo
       const inputPrecio = document.querySelector(`#${id} input[name="total"]`);
       
       // Seleccionar el elemento que contiene el precio base
       const spanPrecioBase = document.querySelector(`#${id} .mini_text span`); // Asegúrate de que este selector sea correcto
       
       // Extraer el precio base usando una expresión regular
       const precioBaseMatch = spanPrecioBase.textContent.match(/Precio base del producto = ([\d,]+)/);
       
       // Verifica que el precio base ha sido encontrado
       if (!precioBaseMatch) {
           console.error(`No se pudo encontrar el precio base para ${id}`);
           return 0; // Retornar 0 si no se encuentra el precio base
       }
       
       const precioBase = parseFloat(precioBaseMatch[1].replace(',', '.'));

       // Obtener el precio actual
       const precioActual = parseFloat(inputPrecio.value.replace(',', '.'));

       // Mostrar el precio base en la consola del navegador
       console.log(`precioBase ${precioBase}`);

       // Sumar 2 al precio base
       const precioModificado = precioBase + 2;

       // Actualizar el valor del campo de precio
       inputPrecio.value = precioModificado.toFixed(2).replace('.', ','); // Formatear de nuevo a string

       return precioModificado; // Retornar el nuevo precio
   }, idArticulo); // Pasar el idArticulo como argumento a la función de evaluación

   // Mostrar el nuevo precio en la consola de Node.js
   console.log(`El nuevo precio del artículo ${idArticulo} es: ${nuevoPrecio.toFixed(2).replace('.', ',')} €`);

   // Hacer clic en el botón "Guardar" usando la referencia `page`
   await page.click(`#${idArticulo} input[type="submit"][value="Guardar"]`);

   // Esperar un momento para asegurarte de que el botón se haya clicado
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

async function main() {
    const puppeteer = require('puppeteer');
    const path = require('path');

    (async () => {
        const browser = await puppeteer.launch({ headless: false }); // Para ver el navegador
        const page = await browser.newPage();

        // Navegar a la página
        await page.goto('https://www.latostadora.com/portafolio_disenos.php');
        await login(page);

        await new Promise(resolve => setTimeout(resolve, 800));
        await page.goto('https://www.latostadora.com/mis_articulos.php');
        await tamañoVentana(page);
        
        await seleccionarTienda(page);

        var longitudPagina = await numeroPaginas(page);
        var vetorNumeros = [];

        for (let index = 1; index <= longitudPagina; index++) {
            vetorNumeros[index] = index;
        }

        for await (const numero of vetorNumeros) {
            console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||Blucle id " + numero);
            await delay(6000);
            await page.goto('https://www.latostadora.com/mis_articulos.php?p=' + numero + '&s=0'), {time: 60000};
            //await page.goto('https://www.latostadora.com/mis_articulos.php?p=1&s=0');
            var idArticulos = await sacarIdArticulos(page);

            for (const idArticulo of idArticulos) {
                await cambiarPrecio(page, idArticulo);
                await delay(800);
            }
        }
        
        console.log("Todo acabo correctamente");
    })();

}


//Ejecucion Del programa
main();
