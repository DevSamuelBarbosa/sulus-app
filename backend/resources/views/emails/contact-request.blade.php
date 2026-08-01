<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Novo contato pelo site</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; background-color: #f4f4f5; padding: 24px;">
    <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px;">
        <tr>
            <td>
                <h1 style="font-size: 18px; margin: 0 0 16px;">Novo contato pelo "Cadastre-se"</h1>
                <p style="font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                    <strong>Nome:</strong> {{ $leadName }}
                </p>
                <p style="font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                    <strong>E-mail:</strong> {{ $leadEmail }}
                </p>
                @if($leadPhone)
                <p style="font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                    <strong>Telefone:</strong> {{ $leadPhone }}
                </p>
                @endif
                @if($companyName)
                <p style="font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                    <strong>Empresa:</strong> {{ $companyName }}
                </p>
                @endif
                @if($leadMessage)
                <p style="font-size: 14px; line-height: 1.6; margin: 16px 0 0; white-space: pre-line;">{{ $leadMessage }}</p>
                @endif
            </td>
        </tr>
    </table>
</body>
</html>
