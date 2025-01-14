const readline = require('readline');

// Crear una interfaz de lectura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Pedir un dato al usuario
rl.question('¿Cuántos diseños? : ', (input) => {
  const numero = Number(input);  // Convertir la entrada a número

  // Validar si el valor es un número válido
  if (isNaN(numero)) {
    console.log('Por favor, introduce un número válido.');
  } else {
    console.log(`Has ingresado el número: ${numero}`);
  }

  // Cerrar la interfaz después de recibir el dato
  rl.close();
});
