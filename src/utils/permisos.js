
// Valores octales de cada rol
const roles = {
  Comandante: 7, // rwx: leer, escribir y eliminar
  Oficial: 6,    // rw-: leer y escribir
  Analista: 4    // r--: solo leer
};

// Verificar si un usuario tiene permiso
export function tienePermiso(rolUsuario, accionRequerida) {
  const permisoUsuario = roles[rolUsuario] || 0;

  return (permisoUsuario & accionRequerida) === accionRequerida;
}
