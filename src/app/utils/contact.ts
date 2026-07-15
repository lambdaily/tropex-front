// Helpers de contacto centralizados (llamada y WhatsApp).
// Antes había ~16 window.open(tel:/wa.me) repetidos por toda la app.

/** Abre el marcador telefónico con el número dado. */
export function openCall(phone: string): void {
  window.open(`tel:${phone.replace(/\s/g, '')}`, '_blank');
}

/**
 * Abre WhatsApp con un contacto. `message` se pasa SIN codificar
 * (esta función lo codifica). Si se omite, abre el chat sin texto.
 */
export function openWhatsApp(phone: string, message?: string): void {
  const num = phone.replace(/\D/g, ''); // solo dígitos (wa.me no quiere +/espacios)
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  window.open(`https://wa.me/${num}${text}`, '_blank');
}

/** Abre WhatsApp sin destinatario (el usuario elige a quién enviar). */
export function shareWhatsApp(message: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}
