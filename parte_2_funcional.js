const { timeout } = require('puppeteer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let contador = 0;
const readline = require('readline');
// Crear una interfaz de lectura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



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
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 0.5 segundos
        await page.click(loginButtonSelector);
    } else {
        console.error("El botón 'Iniciar sesión' está deshabilitado o no es visible.");
    }

    console.log("Login Echo");
}

async function nombreDiseños(page) {

    await new Promise(resolve => setTimeout(resolve, 5000)); // Reemplazar setTimeout con un await

    // Esperar a que todos los inputs estén disponibles
    await page.waitForSelector('.editName.disenos.designs.input', { timeout: 5000 });

    // Obtener los valores de todos los inputs
    const values = await page.$$eval('.editName.disenos.designs.input', inputs => inputs.map(input => input.value));

    // Mostrar los valores en la consola
    console.log(values);
    return values;
}

async function allIds(page) {

    // Esperar a que el contenedor con la clase 'all_designs' esté disponible
    await page.waitForSelector('.all_designs', { timeout: 5000 });

    // Obtener los 'id' de todos los div hijos dentro del contenedor '.all_designs'
    const ids = await page.$$eval('.all_designs div', divs =>
        divs
            .map(div => div.id)
            .filter(id => id && id.startsWith('each_design_')) // Filtrar los divs que tienen id
            .map(id => id.replace('each_design_', '')) // Reemplazar 'each_design_' con una cadena vacía
    );

    // Imprimir o usar los ids obtenidos
    console.log(ids);
    return ids;
}

async function botonCrear(page) {
    // Esperar a que el botón sea visible
    await page.waitForSelector('#btn-create-composition', { timeout: 5000 });
    // Hacer clic en el botón
    await page.click('#btn-create-composition');
    console.log("Botón 'Crear' clicado con éxito.");
}

async function allFamiliasProductos(page) {
    // Esperar a que la lista sea visible
    await page.waitForSelector('.nav.nav-tabs.tabs_private.customizer', { timeout: 5000 });

    // Obtener los atributos data-original-title de todos los li
    const titulos = await page.evaluate(() => {
        // Seleccionar todos los elementos li dentro de la ul
        const elementosLi = Array.from(document.querySelectorAll('.nav.nav-tabs.tabs_private.customizer li'));
        // Mapear y obtener el atributo data-original-title de cada li
        return elementosLi.map(li => li.getAttribute('data-tab'));
    });

    // Mostrar los títulos en la consola
    console.log("Familias de Producto Data-tab de todos los li:", titulos);

    return titulos;
}

async function allModelos(page) {
    //tab-pane product-thumbnails active
    // Esperar a que la lista sea visible
    await page.waitForSelector('.tab-pane.product-thumbnails.active', { timeout: 5000 });

    const titulos = await page.evaluate(() => {
        const elementosLi = Array.from(document.querySelectorAll('.tab-pane.product-thumbnails.active div'));
        return elementosLi.map(li => li.getAttribute('data-model'));
    });

    var titulosSinNull = [];
    for (let index = 0; index < titulos.length; index++) {
        if (titulos[index] != null) {
            titulosSinNull.push(titulos[index]);
        }
    }
    console.log("Modelos del Producto Data-model de todos los li:", titulosSinNull);

    return titulosSinNull;
}

async function allColores(page) {
    // Esperar a que la lista sea visible
    await page.waitForSelector('.customizer-choose-color.selectable.clearfix', { timeout: 5000 });

    // Obtener los atributos data-original-title de todos los li
    const titulos = await page.evaluate(() => {
        // Seleccionar todos los elementos li dentro de la ul
        const elementosLi = Array.from(document.querySelectorAll('.customizer-choose-color.selectable.clearfix li'));
        // Mapear y obtener el atributo data-original-title de cada li
        return elementosLi.map(li => li.getAttribute('data-original-title'));
    });

    // Mostrar los títulos en la consola
    console.log("Colores data-original-title de todos los li:", titulos);

    return titulos;
}

async function crearProducto(page) {
    await tamañoVentana(page); // Asegúrate de llamar a esto primero
    const Familias = await allFamiliasProductos(page);

    for (const Familia of Familias) {
        if (Familia === "paintings") {
            console.log("Proceso completado exitosamente.");
            break;
        }

        await delay(1000);
        await page.waitForSelector('[data-toggle="pill"]', { visible: true });
        await page.click('[data-toggle="pill"]');
        await page.waitForSelector('[data-tab="' + Familia + '"]', { visible: true });
        await page.click('[data-tab="' + Familia + '"]');
        console.log("Botón Familia " + Familia + " clicado.\n");

        const Modelos = await allModelos(page);
        for (const Modelo of Modelos) {
            let contador = 0;

            if (
                (Modelo !== "P_A1" && Modelo !== "H_V3" && Modelo !== "C_A1" && Modelo !== "A_A1")
                &&
                (Modelo == "H_A1" || Modelo == "H_W4" || Modelo == "H_C2" || Modelo == "H_F1"
                    || Modelo == "M_L1" || Modelo == "M_F1" || Modelo == "H_D2" || Modelo == "M_M2"
                    || Modelo == "U_A1" || Modelo == "N_A2" || Modelo == "N_D1" || Modelo == "N_C2"
                    || Modelo == "G_A1" || Modelo == "B_D1")
            ) {

                await delay(1000);
                await page.waitForSelector('[data-toggle="pill"]', { visible: true });
                await page.click('[data-toggle="pill"]');
                await delay(1000);
                await page.waitForSelector('[data-tab="' + Familia + '"]', { visible: true });
                await page.click('[data-tab="' + Familia + '"]');
                await delay(1000);

                console.log("Modelo " + Modelo);
                await page.waitForSelector('[data-model="' + Modelo + '"]', { visible: true });
                await page.click('[data-model="' + Modelo + '"]');
                console.log("Botón Modelo " + Modelo + " clicado.");
                await delay(1000);

                const Colores = await allColores(page);
                for (const Color of Colores) {
                    console.log("Color " + Color);
                    if ((Modelo === "M_D4" && ["Lavanda", "Rosa coral", "Turquesa"].includes(Color)) ||
                        (Modelo === "N_C2" && ["Celeste", "Rosa claro"].includes(Color))) {
                        console.log("Estos colores no existen en este producto.");
                    } else {
                        if (Color == "Blanco" || Color == "Negro" || Color == "Rojo") {
                            await delay(2000);
                            await page.waitForSelector('[data-original-title="' + Color + '"]', { visible: true });
                            await page.click('[data-original-title="' + Color + '"]');
                            console.log("Botón Color " + Color + " clicado.");

                            // Llama a la función si es la primera vez que el contador es 0
                            if (contador === 0) {
                                console.log("Entrando a mover el elemento.");
                                await delay(3000);
                                var valores = await encontrarMove(page, "move");
                                console.log(valores[0] + " " + valores[1]);
                                await delay(1000);
                                await clickAndDrag(valores[0], valores[1], 0, page);

                                await delay(1000);
                                await page.waitForSelector('button.customizer-image-center-horizontal', { visible: true });
                                await page.click('button.customizer-image-center-horizontal');

                                await delay(1300);
                                var valoresB = await encontrarMove(page, "se-resize");
                                await delay(1000);
                                await clickAndDrag(valoresB[0], valoresB[1], 400, page);

                                contador++; // Incrementa el contador aquí
                            }

                            await delay(2000);
                            await botonComprarSeguir(page);
                            await delay(800);

                        }
                    }
                }
            }
        }
    }
}




async function tamañoVentana(page) {

    // Maximizar la ventana
    const [width, height] = [1200, 1200]; // Cambia a la resolución deseada
    await page.setViewport({ width, height });
    await page.evaluate(() => {
        // Establecer zoom en el cuerpo
        document.body.style.zoom = '80%'; // Cambia el porcentaje según sea necesario
    });
}

async function clickAndDrag(x, y, distance, page) {
    const mouse = page.mouse;

    await mouse.move(x, y);  // Mover el ratón a las coordenadas
    await mouse.down();       // Mantener el clic presionado
    await mouse.move(x, y + distance); // Mover hacia abajo
    await mouse.up();         // Soltar el clic
    console.log("Clica");
}

async function encontrarMove(page, loQueBusca) {
    const mouse = page.mouse;
    await page.waitForSelector('canvas.upper-canvas');
    console.log("encontrarMove");
    var a;
    var b;

    // Inyectar un punto rojo en la página
    await page.evaluate(() => {
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.width = '10px'; // Tamaño del punto
        dot.style.height = '10px';
        dot.style.borderRadius = '50%'; // Hacerlo circular
        dot.style.backgroundColor = 'red'; // Color del punto
        dot.style.pointerEvents = 'none'; // Ignorar eventos del ratón
        dot.style.zIndex = '9999'; // Asegurar que esté por encima
        document.body.appendChild(dot);
        window.dotElement = dot; // Guardar referencia en el contexto global
    });

    // Obtener el tamaño y la posición del canvas
    const canvas = await page.$('canvas.upper-canvas');
    const canvasBoundingBox = await canvas.boundingBox();

    // Coordenadas iniciales y finales manualmente definidas
    /*
    const startY = 5000; // Cambia esta coordenada según lo necesites
    const endY = 100;   // Cambia esta coordenada según lo necesites
    const startX = 100; // Cambia esta coordenada según lo necesites
    const endX = 1000;   // Cambia esta coordenada según lo necesites
    */

    const endY = 120;   // Cambia esta coordenada según lo necesites
    const startX = 200; // Cambia esta coordenada según lo necesites
    const startY = 700; // Cambia esta coordenada según lo necesites
    const endX = 700;   // Cambia esta coordenada según lo necesites

    return new Promise(async (resolve, reject) => {
        let encontrado = false;
        let a, b;
    
        try {
            while (!encontrado) {
                for (let x = startX; x < endX; x += 20) {
                    for (let y = endY; y < startY; y += 20) {
                        await mouse.move(x, y);
    
                        // Ajustar la posición del punto rojo según el bounding box del canvas
                        await page.evaluate((canvasBoundingBox, x, y) => {
                            const dot = window.dotElement;
                            dot.style.left = `${canvasBoundingBox.x + x}px`;
                            dot.style.top = `${canvasBoundingBox.y + y}px`;
                        }, canvasBoundingBox, x, y);
    
                        // Esperar a que el canvas aparezca en la página
                        await page.waitForSelector('canvas.upper-canvas');
    
                        // Ejecutar código en el contexto de la página para obtener el valor del cursor
                        const cursorValue = await page.evaluate(canvas => {
                            return window.getComputedStyle(canvas).cursor;
                        }, canvas);
    
                        if (cursorValue === loQueBusca) {
                            console.log("Encontrado en:", x, y);
                            encontrado = true;
                            a = x;
                            b = y;
                            break;
                        }
                    }
                    if (encontrado) break; // Salir del ciclo exterior si ya se ha encontrado
                }
            }
    
            resolve([a, b]); // Resolver la promesa con el valor encontrado
        } catch (error) {
            reject(error); // Rechazar la promesa si hay un error
        }
    });
}

async function botonComprarSeguir(page) {
    console.log("botonComprarSeguir");
    await page.waitForSelector('#btn-create-composition', { timeout: 5000 });
    await page.click('#btn-create-composition');

    await delay(1000);
    await page.waitForSelector('[href="javascript:stay_in_pers_resp();"]', { visible: true });
    await page.click('[href="javascript:stay_in_pers_resp();"]');

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

async function main(numero) {
    const puppeteer = require('puppeteer');
    const path = require('path');
    let contadorCiclos = 0;
    (async () => {
        const browser = await puppeteer.launch({ headless: false }); // Para ver el navegador
        const page = await browser.newPage();

        // Navegar a la página
        await page.goto('https://www.latostadora.com/portafolio_disenos.php');

        await login(page);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.goto('https://www.latostadora.com/portafolio_disenos.php');
        await seleccionarTienda(page);
        let valueTienda = await page.evaluate(() => {
            const selectElement = document.querySelector('#shop_selector');
            return selectElement.value; // Devuelve el value de la opción seleccionada
        });
        await delay(2000);
        console.log("valueTienda " + valueTienda);

        var Ides = await allIds(page);
        for (const id of Ides) {
            if (numero == contadorCiclos) {
                console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                console.log("|||||||||||||||||||||||||||||||||||||||||||||- Se han realizado Todas las inserciones -|||||||||||||||||||||||||||||||||||||||||||||");
                console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                break;
            } else {

                contadorCiclos++;
                console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||Blucle id " + id);

                await page.goto('https://www.latostadora.com/personalizador_micuenta.php?product_family=CO&t=' + valueTienda + '&a=' + id, {
                    waitUntil: 'networkidle2'
                });

                await tamañoVentana(page);
                await crearProducto(page);
            }
        }
        console.log("||||||||||||||||||||||||||||- Todo Acabo Correctamente -|||||||||||||||||||||||||||||||||||||||");
    })();

}


//Ejecucion Del programa

// Pedir un dato al usuario
rl.question('¿Cuántos diseños? : ', (input) => {
    const numero = Number(input);  // Convertir la entrada a número

    // Validar si el valor es un número válido
    if (isNaN(numero) && numero > 0) {
        console.log('Por favor, introduce un número válido.');
    } else {
        console.log(`Has ingresado el número: ${numero}`);
        main(numero);
    }

    // Cerrar la interfaz después de recibir el dato
    rl.close();
});
