<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Redefina sua senha</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; background-color: #f4f4f5; padding: 24px;">
    <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px;">
        <tr>
            <td>
                <h1 style="font-size: 18px; margin: 0 0 16px;">Olá, {{ $userName }}!</h1>
                <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                    Recebemos um pedido para redefinir a senha da sua conta na plataforma
                    Sulus Benefícios. Clique no botão abaixo para escolher uma nova senha.
                </p>
                <p style="text-align: center; margin: 0 0 16px;">
                    <a href="{{ $resetUrl }}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold;">
                        Redefinir minha senha
                    </a>
                </p>
                <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 0 0 8px;">
                    Este link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar
                    este e-mail — sua senha atual continua funcionando normalmente.
                </p>
                <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 0;">
                    Se o botão não funcionar, copie e cole este endereço no navegador:<br>
                    <a href="{{ $resetUrl }}" style="color: #4f46e5;">{{ $resetUrl }}</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
