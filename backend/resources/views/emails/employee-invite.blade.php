<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Ative seu acesso à Sulus Benefícios</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; background-color: #f4f4f5; padding: 24px;">
    <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px;">
        <tr>
            <td>
                <h1 style="font-size: 18px; margin: 0 0 16px;">Olá, {{ $employeeName }}!</h1>
                <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                    Você foi cadastrado como funcionário de <strong>{{ $companyName }}</strong> na
                    plataforma Sulus Benefícios. Para acessar sua conta e gerar seu QR Code de
                    benefício, defina sua senha clicando no botão abaixo.
                </p>
                <p style="text-align: center; margin: 0 0 16px;">
                    <a href="{{ $activationUrl }}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold;">
                        Definir minha senha
                    </a>
                </p>
                <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 0 0 8px;">
                    Este link expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.
                </p>
                <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 0;">
                    Se o botão não funcionar, copie e cole este endereço no navegador:<br>
                    <a href="{{ $activationUrl }}" style="color: #4f46e5;">{{ $activationUrl }}</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
