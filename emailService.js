const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const initializeEmailService = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  
  if (emailProvider === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (emailProvider === 'smtp') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  if (transporter) {
    transporter.verify((error, success) => {
      if (error) {
        console.error('Error configurando servicio de email:', error);
      } else {
        console.log('Servicio de email configurado correctamente');
      }
    });
  }
};

const sendEmail = async (to, subject, htmlContent) => {
  if (!transporter) {
    console.warn('Servicio de email no configurado');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email enviado a ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

const sendTicketCreatedEmail = async (userEmail, userName, ticketId, ticketTitle, ticketDescription) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Ticket Creado Exitosamente</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Tu ticket ha sido creado exitosamente en el sistema Help Desk CESUN.</p>
        
        <div style="background-color: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>ID del Ticket:</strong> ${ticketId.substring(0, 12)}</p>
          <p style="margin: 5px 0;"><strong>Título:</strong> ${ticketTitle}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> Abierto</p>
        </div>

        <p>Tu solicitud ha sido registrada y será atendida por nuestro equipo de soporte. Recibirás notificaciones por correo cada vez que haya una actualización en tu ticket.</p>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Para ver más detalles de tu ticket, inicia sesión en el sistema Help Desk CESUN.</p>
          <p>Si tienes preguntas, no dudes en contactar al equipo de soporte.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail(userEmail, `Ticket Creado: ${ticketTitle}`, htmlContent);
};

const sendStatusChangeEmail = async (userEmail, userName, ticketId, ticketTitle, oldStatus, newStatus) => {
  const statusLabels = {
    'abierto': 'Abierto',
    'atendido': 'Atendido',
    'cancelado': 'Cancelado',
    'retroalimentacion': 'En Retroalimentación'
  };

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Actualización de Estado del Ticket</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${userName}</strong>,</p>
        <p>El estado de tu ticket ha sido actualizado.</p>
        
        <div style="background-color: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>ID del Ticket:</strong> ${ticketId.substring(0, 12)}</p>
          <p style="margin: 5px 0;"><strong>Título:</strong> ${ticketTitle}</p>
          <p style="margin: 5px 0;">
            <strong>Estado Anterior:</strong> <span style="color: #999;">${statusLabels[oldStatus]}</span>
          </p>
          <p style="margin: 5px 0;">
            <strong>Nuevo Estado:</strong> <span style="color: #667eea; font-weight: bold;">${statusLabels[newStatus]}</span>
          </p>
        </div>

        <p>Puedes ver más detalles y responder en el sistema Help Desk CESUN.</p>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Recibirás notificaciones por correo para cada actualización de tu ticket.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail(userEmail, `Actualización: ${ticketTitle}`, htmlContent);
};

const sendNewMessageEmail = async (userEmail, userName, ticketId, ticketTitle, senderName, message) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Nuevo Mensaje en tu Ticket</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${userName}</strong>,</p>
        <p><strong>${senderName}</strong> ha enviado un nuevo mensaje en tu ticket.</p>
        
        <div style="background-color: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Ticket:</strong> ${ticketTitle}</p>
          <p style="margin: 5px 0;"><strong>ID:</strong> ${ticketId.substring(0, 12)}</p>
          <p style="margin: 10px 0 0 0;"><strong>Mensaje:</strong></p>
          <p style="margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>

        <p>Inicia sesión en Help Desk CESUN para responder y ver más detalles.</p>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Este es un mensaje automático. Por favor no respondas a este correo.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail(userEmail, `Nuevo mensaje: ${ticketTitle}`, htmlContent);
};

const sendAdminNotificationEmail = async (adminEmail, adminName, ticketId, ticketTitle, userName, action, details) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Notificación de Ticket</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${adminName}</strong>,</p>
        <p>Hay una nueva actividad en un ticket que requiere tu atención.</p>
        
        <div style="background-color: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Acción:</strong> ${action}</p>
          <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketId.substring(0, 12)}</p>
          <p style="margin: 5px 0;"><strong>Título:</strong> ${ticketTitle}</p>
          <p style="margin: 5px 0;"><strong>Solicitante:</strong> ${userName}</p>
          <p style="margin: 5px 0;"><strong>Detalles:</strong> ${details}</p>
        </div>

        <p>Accede al panel de administración para gestionar este ticket.</p>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Este es un mensaje automático del sistema Help Desk CESUN.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail(adminEmail, `[ADMIN] Nuevo evento en ticket: ${ticketTitle}`, htmlContent);
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendTicketCreatedEmail,
  sendStatusChangeEmail,
  sendNewMessageEmail,
  sendAdminNotificationEmail
};
