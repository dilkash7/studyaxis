export function buildWhatsAppURL(data: {
  name: string;
  phone: string;
  course: string;
  college: string;
  location: string;
}) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent(
    `Hi StudyAxis! I am interested in admission.\n\n` +
    `👤 Name: ${data.name}\n` +
    `📞 Phone: ${data.phone}\n` +
    `📚 Course: ${data.course}\n` +
    `🏫 College: ${data.college}\n` +
    `📍 Location: ${data.location}\n\n` +
    `Please guide me further.`
  );
  return `https://wa.me/${number}?text=${message}`;
}