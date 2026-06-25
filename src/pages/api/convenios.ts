// src/pages/api/convenios.ts
import type { APIRoute } from 'astro';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validar datos requeridos
    if (!data.empresa_nombre || !data.contacto_email || !data.mensaje) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400 }
      );
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY no está configurada');
      return new Response(
        JSON.stringify({ error: 'Configuración de servidor incompleta' }),
        { status: 500 }
      );
    }

    // HTML del email para las matronas
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #314832 0%, #233524 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 28px;">Nueva Solicitud de Convenio</h2>
        </div>
        
        <div style="background: #faf8f5; padding: 30px; border-radius: 0 0 12px 12px;">
          <h3 style="color: #314832; margin-top: 0;">Detalles de la Solicitud</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #314832;">Empresa:</td>
              <td style="padding: 12px 0; color: #666;">${data.empresa_nombre}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #314832;">Contacto:</td>
              <td style="padding: 12px 0; color: #666;">${data.contacto_nombre}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #314832;">Email:</td>
              <td style="padding: 12px 0; color: #666;"><a href="mailto:${data.contacto_email}">${data.contacto_email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #314832;">Teléfono:</td>
              <td style="padding: 12px 0; color: #666;">${data.contacto_telefono}</td>
            </tr>
            ${data.tipo_convenio ? `
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #314832;">Tipo de Convenio:</td>
              <td style="padding: 12px 0; color: #666;">${data.tipo_convenio}</td>
            </tr>
            ` : ''}
          </table>

          <h3 style="color: #314832; margin-top: 24px;">Mensaje</h3>
          <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${data.mensaje}</p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />

          <p style="font-size: 12px; color: #999;">
            Este mensaje fue enviado desde el formulario de convenios de Saberes.<br/>
            <a href="https://www.saberes.cl" style="color: #C19A6B; text-decoration: none;">www.saberes.cl</a>
          </p>
        </div>
      </div>
    `;

    // Confirmación al contacto
    const confirmHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #314832 0%, #233524 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 28px;">¡Gracias por tu interés!</h2>
        </div>
        
        <div style="background: #faf8f5; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #666; line-height: 1.6;">
            Hola ${data.contacto_nombre},<br/><br/>
            Recibimos tu solicitud de convenio corporativo. Las matronas de Saberes te contactarán pronto para explorar esta oportunidad juntos.<br/><br/>
            <strong>Datos registrados:</strong><br/>
            Empresa: ${data.empresa_nombre}<br/>
            Email: ${data.contacto_email}<br/>
            Teléfono: ${data.contacto_telefono}
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Centro Médico Saberes<br/>
            O'Higgins Poniente 77, Concepción<br/>
            <a href="https://wa.me/56954365775" style="color: #C19A6B;">WhatsApp</a>
          </p>
        </div>
      </div>
    `;

    // Enviar email a las matronas
    const matronasRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Saberes Convenios <onboarding@resend.dev>', // ← usa este while el dominio no esté verificado
        to: 'saberesspa@gmail.com',
        reply_to: data.contacto_email,                    // ← al responder, va directo al contacto
        subject: `Nueva Solicitud de Convenio - ${data.empresa_nombre}`,
        html: emailHTML,
      }),
    });

    if (!matronasRes.ok) {
      const errBody = await matronasRes.json();
      console.error('Error Resend (matronas):', errBody);
      throw new Error(`Resend error: ${errBody.message || matronasRes.status}`);
    }

    // Enviar confirmación al contacto
    const contactoRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Saberes <onboarding@resend.dev>', // ← mismo from por ahora
        to: data.contacto_email,
        subject: 'Hemos recibido tu solicitud de convenio - Saberes',
        html: confirmHTML,
      }),
    });

    if (!contactoRes.ok) {
      const errBody = await contactoRes.json();
      console.error('Error Resend (contacto):', errBody);
      // No lanzamos error aquí — el email principal ya llegó
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Solicitud enviada correctamente' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en API convenios:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error al procesar la solicitud' }),
      { status: 500 }
    );
  }
};