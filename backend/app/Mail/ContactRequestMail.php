<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $leadName,
        public readonly string $leadEmail,
        public readonly ?string $leadPhone,
        public readonly ?string $companyName,
        public readonly ?string $leadMessage,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Novo contato pelo site — Sulus Benefícios',
            replyTo: [$this->leadEmail],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.contact-request');
    }
}
