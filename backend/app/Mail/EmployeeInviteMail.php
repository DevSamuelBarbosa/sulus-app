<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent when an employee login is created (App\Modules\Employees\Services\
 * EmployeeActivationService::sendInvite) so they set their own password
 * instead of the company/admin choosing one for them. Queued so a slow/down
 * mail provider never blocks the employee create/restore request — see
 * QUEUE_CONNECTION and the queue worker requirement in DEPLOY.md.
 */
class EmployeeInviteMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $employeeName,
        public readonly string $companyName,
        public readonly string $activationUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Ative seu acesso à Sulus Benefícios');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.employee-invite');
    }
}
