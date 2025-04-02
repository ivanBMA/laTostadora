<div class="canvas-container" style="width: 658px; height: 520px; position: relative; user-select: none;">
    <canvas id="customizer-canvas" class="lower-canvas" width="658" height="520" style="position: absolute; width: 658px; height:
     520px; left: 0px; top: 0px; user-select: none; background-image: url(&quot;https://srv.latostadora.com/models.dll/model-image--i:
     H_J3;s:20180503;b:f3f3f3;bi:000000;fb:f;e:1.png&quot;);">
    </canvas><canvas class="upper-canvas " width="2000" height="520" style="position: absolute; width: 958px; height: 520px; left: 0px; 
    top: 0px; user-select: none; cursor: default;"></canvas>
</div>
/*
cursor: default
cursor: se-resize
cursor: move
318.191
481.131
*/

document.addEventListener('mousemove', (event) => {
    const x = event.clientX; // Posición X del ratón
    const y = event.clientY; // Posición Y del ratón
    console.log(`Posición del ratón: (${x}, ${y})`);
});
// Seleccionar el canvas

const canvas = document.querySelector('canvas.upper-canvas');

// Agregar un event listener al evento mousemove
canvas.addEventListener('mousemove', () => {
    // Obtener el valor actual del cursor
    const cursorValue = window.getComputedStyle(canvas).cursor;

    // Imprimir el valor actual del cursor en cada movimiento
    console.log(`El cursor actual es: ${cursorValue}`);
});

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
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 0.5 segundos
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
/*
async function crearProducto(page) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    setTimeout(async () => {

        const Familias = await allFamiliasProductos(page);



        for (const Familia of Familias) {
            if (Familia == "paintings") {
                console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                console.log("|||||||||||||||||||||||Se Acabo Correctamente                |||||||||||||||||||||||||||||||||||");
                console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                break;
            }
            
            // Esperar a que el botón sea visible
            await page.waitForSelector('[data-tab="' + Familia + '"]', { visible: true });
            // Hacer clic en el botón
            await page.click('[data-tab="' + Familia + '"]');
            console.log("Botón Familia____________________________________________________________________________" + Familia + "\n\n");
            
            const Modelos = await allModelos(page);
            for (const Modelo of Modelos) {
                var contador = 0;
                if (Modelo != "P_A1" && Modelo != "H_V3") {
                    // Esperar a que el botón sea visible
                    await page.waitForSelector('[data-toggle="pill"]', { visible: true });
                    // Hacer clic en el botón
                    await page.click('[data-toggle="pill"]');
                    console.log("Botón data-toggle____________________________________________________________________________" + Familia + "\n\n");
                    await delay(800);

                    // Esperar a que el botón sea visible
                    await page.waitForSelector('[data-tab="' + Familia + '"]', { visible: true });
                    // Hacer clic en el botón
                    await page.click('[data-tab="' + Familia + '"]');
                    console.log("Botón Familia____________________________________________________________________________" + Familia + "\n\n");
                    await delay(800);

                    console.log("Modelo " + Modelo);
                    await page.waitForSelector('[data-model="' + Modelo + '"]', { visible: true });
                    await page.click('[data-model="' + Modelo + '"]');
                    console.log("Botón Modelo ____________" + Modelo + "____________ clicado con éxito.");

                    const Colores = await allColores(page);//Usar Blanco Negro y Rojo
                    for (const Color of Colores) {
                        console.log("Color " + Color);
                        if (Modelo == "M_D4" && (Color == "Lavanda" || Color == "Rosa coral" || Color == "Turquesa")) {
                            console.log("Estos colores no existen en este producto Lavanda, Rosa coral, Turquesa")
                        } if (Modelo == "N_C2" && (Color == "Celeste" || Color == "Rosa claro")) {
                            console.log("Estos colores no existen en este producto Lavanda, Rosa coral, Turquesa")
                        } else {
                            await page.waitForSelector('[data-original-title="' + Color + '"]', { visible: true });
                            await page.click('[data-original-title="' + Color + '"]');
                            console.log("Botón Color ____________" + Color + "____________ clicado con éxito.");
                        }
                        //<--x////////////////////////////////////////////////////////////////////////////////////
                        
                        
                        //Llamar a la función
                        
                        if (contador == 0) {
                            console.log("entro____________________________________________________________________________________||||||||||||||||||||||||||||||||||");
                            console.log("entro____________________________________________________________________________________||||||||||||||||||||||||||||||||||");
                            console.log("entro____________________________________________________________________________________||||||||||||||||||||||||||||||||||");
                            
                            var valores = await encontrarMove(page, "move");
                            
                            console.log(valores[0] + " " + valores[1]);
                            await delay(1000);
                            await clickAndDrag(valores[0], valores[1], 0, page);


                            await delay(2000);
                            await page.waitForSelector('button.customizer-image-center-horizontal');
                            await page.click('button.customizer-image-center-horizontal');

                            var valoresB = await encontrarMove(page, "se-resize");
                            await delay(2000);
                            await clickAndDrag(valoresB[0], valoresB[1], 400, page);


                            contador++;
                        }

                        ////////////////////////////////////////////////////////////////////////////////
                        //x-->
                        await delay(1000);
                    }

                    await delay(1000);
                }


            }

            await delay(1300);
        }

    }, 5000);
}
*/

async function crearProducto(page) {
    await tamañoVentana(page); // Asegúrate de llamar a esto primero
    const Familias = await allFamiliasProductos(page);

    for (const Familia of Familias) {
        if (Familia === "paintings") {
            console.log("Proceso completado exitosamente.");
            break;
        }

        await delay(1300);
        await page.waitForSelector('[data-toggle="pill"]', { visible: true });
        await page.click('[data-toggle="pill"]');
        await page.waitForSelector('[data-tab="' + Familia + '"]', { visible: true });
        await page.click('[data-tab="' + Familia + '"]');
        console.log("Botón Familia " + Familia + " clicado.\n");

        const Modelos = await allModelos(page);
        for (const Modelo of Modelos) {
            let contador = 0;

            if (Modelo !== "P_A1" && Modelo !== "H_V3" && Modelo !== "C_A1" && Modelo !== "A_A1") {
                await delay(1500);
                await page.waitForSelector('[data-toggle="pill"]', { visible: true });
                await page.click('[data-toggle="pill"]');
                await delay(1500);
                await page.waitForSelector('[data-tab="' + Familia + '"]', { visible: true });
                await page.click('[data-tab="' + Familia + '"]');
                await delay(1500);

                console.log("Modelo " + Modelo);
                await page.waitForSelector('[data-model="' + Modelo + '"]', { visible: true });
                await page.click('[data-model="' + Modelo + '"]');
                console.log("Botón Modelo " + Modelo + " clicado.");
                await delay(7000);

                const Colores = await allColores(page);
                for (const Color of Colores) {
                    console.log("Color " + Color);
                    if ((Modelo === "M_D4" && ["Lavanda", "Rosa coral", "Turquesa"].includes(Color)) || 
                        (Modelo === "N_C2" && ["Celeste", "Rosa claro"].includes(Color))) {
                        console.log("Estos colores no existen en este producto.");
                    } else {
                        await page.waitForSelector('[data-original-title="' + Color + '"]', { visible: true });
                        await page.click('[data-original-title="' + Color + '"]');
                        console.log("Botón Color " + Color + " clicado.");

                        // Llama a la función si es la primera vez que el contador es 0
                        if (contador === 0) {
                            console.log("Entrando a mover el elemento.");
                            await delay(1000);
                            var valores = await encontrarMove(page, "move");
                            console.log(valores[0] + " " + valores[1]);
                            await delay(6000);
                            await clickAndDrag(valores[0], valores[1], 0, page);
                            
                            await delay(3000);
                            await page.waitForSelector('button.customizer-image-center-horizontal', { visible: true });
                            await page.click('button.customizer-image-center-horizontal');

                            var valoresB = await encontrarMove(page, "se-resize");
                            await delay(3000);
                            await clickAndDrag(valoresB[0], valoresB[1], 400, page);

                            contador++; // Incrementa el contador aquí
                        }

                        await botonComprarSeguir(page);
                        await delay(1000);
                    }
                    break;
                }
                await delay(1300);
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
    const startY = 500; // Cambia esta coordenada según lo necesites
    const endY = 100;   // Cambia esta coordenada según lo necesites
    const startX = 100; // Cambia esta coordenada según lo necesites
    const endX = 800;   // Cambia esta coordenada según lo necesites
    */

    const startY = 490; // Cambia esta coordenada según lo necesites
    const endY = 120;   // Cambia esta coordenada según lo necesites
    const startX = 300; // Cambia esta coordenada según lo necesites
    const endX = 520;   // Cambia esta coordenada según lo necesites

    for (let x = startX; x < endX; x += 8) {
        for (let y = endY; y < startY; y += 8) {
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
                return [x, y]; // Retornar un objeto con las coordenadas
            }
        }
    }

    console.log("Acabo");
    return null; // Retornar null si no se encuentra
}

async function botonComprarSeguir(page) {
    console.log("botonComprarSeguir");
    await page.waitForSelector('#btn-create-composition', { timeout: 5000 });
    await page.click('#btn-create-composition');

    await delay(1300);
    await page.waitForSelector('[href="javascript:stay_in_pers_resp();"]', { visible: true });
    await page.click('[href="javascript:stay_in_pers_resp();"]');

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
        await page.goto('https://www.latostadora.com/portafolio_disenos.php');

        var Ides = await allIds(page);
        for (const id of Ides) {
            console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||Blucle id " + id);

            await page.goto('https://www.latostadora.com/personalizador_micuenta.php?product_family=CO&t=140208&a=' + id, {
                waitUntil: 'networkidle2'
            });

            await tamañoVentana(page);
            await crearProducto(page);

        }

    })();

}


//Ejecucion Del programa
main();
