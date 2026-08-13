export const sendWhatsAppNotification = ({ phone, name, service, date, time }) => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  const message = `✨ *¡Hola ${name}! Tu turno en Lumière Studio está confirmado.* ✨\n\n` +
    `📌 *Servicio:* ${service}\n` +
    `📅 *Fecha:* ${date}\n` +
    `⏰ *Hora:* ${time} hs\n\n` +
    `¡Te esperamos! Si necesitas realizar algún cambio, respóndenos a este mensaje.`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
};