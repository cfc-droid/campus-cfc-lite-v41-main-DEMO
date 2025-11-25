// ==============================================
// WELCOME.JS — Banner de bienvenida dinámico
// Campus CFC LITE v1.5
// ==============================================

const usuario = localStorage.getItem('nombreUsuario') || 'Trader';
const hora = new Date().getHours();

let saludo =
  hora < 12
    ? 'Buenos días'
    : hora < 19
    ? 'Buenas tardes'
    : 'Buenas noches';

const banner = document.getElementById('banner-saludo');
if (banner) {
  banner.innerText = `${saludo}, ${usuario} 🌅`;
  banner.style.opacity = '1';
}
