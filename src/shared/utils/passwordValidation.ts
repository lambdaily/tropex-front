export function validatePassword(password: string) {
  if (!password) {
    return 'Ingresa una contraseña';
  }

  if (password.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres';
  }

  if (/^\d+$/.test(password)) {
    return 'La contraseña no puede ser completamente numérica';
  }

  return undefined;
}
