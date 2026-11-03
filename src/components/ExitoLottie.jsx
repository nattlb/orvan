import Lottie from 'lottie-react';
import animacion from '../animations/exito.json';

// Animación Lottie: círculo + tilde que se dibujan al enviar el formulario con éxito.
// Para cambiarla por otra: bajá un .json desde lottiefiles.com, ponelo en src/animations y cambiá el import.
export default function ExitoLottie({ tamano = 96 }) {
  return (
    <Lottie
      animationData={animacion}
      loop={false}
      aria-hidden="true"
      style={{ width: tamano, height: tamano }}
    />
  );
}
