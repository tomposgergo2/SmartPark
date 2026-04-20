<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket Receipt</title>
</head>
<body>
    <h2>SmartPark - Ticket Receipt</h2>

    <p>Thank you for your purchase. Below are the details of your ticket.</p>

    <ul>
        <li><strong>Ticket ID:</strong> {{ $ticket->id }}</li>
        <li><strong>Vehicle plate:</strong> {{ optional($ticket->vehicle)->plate_number ?? 'N/A' }}</li>
        <li><strong>Zone:</strong> {{ optional($ticket->zone)->name ?? 'N/A' }}</li>
        <li><strong>Start time:</strong> {{ $ticket->start_time }}</li>
        <li><strong>End time:</strong> {{ $ticket->end_time }}</li>
        <li><strong>Price (cents):</strong> {{ $ticket->price }}</li>
    </ul>

    <h4>Payment</h4>
    <ul>
        <li><strong>Payment ID:</strong> {{ $payment->id }}</li>
        <li><strong>Amount:</strong> {{ $payment->amount }}</li>
        <li><strong>Method:</strong> {{ $payment->method }}</li>
        <li><strong>Transaction ref:</strong> {{ $payment->transaction_ref }}</li>
        <li><strong>Status:</strong> {{ $payment->status }}</li>
    </ul>

    <p>If you have any questions please contact support.</p>
</body>
</html>
