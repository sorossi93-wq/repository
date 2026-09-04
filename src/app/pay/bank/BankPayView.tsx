"use client";



import { useCallback, useState } from "react";

import type { BankTransferDetails } from "@/lib/bank";



interface BankPayViewProps {

  giftName: string;

  guestName: string;

  details: BankTransferDetails;

}



function CopyButton({ value, label }: { value: string; label: string }) {

  const [copied, setCopied] = useState(false);



  const copy = useCallback(async () => {

    try {

      await navigator.clipboard.writeText(value);

      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);

    } catch {

      /* clipboard unavailable */

    }

  }, [value]);



  return (

    <button

      type="button"

      onClick={copy}

      className="shrink-0 rounded-sm border border-ivory-warm px-3 py-1.5 text-xs uppercase tracking-wide text-ink-muted transition hover:border-wine/30 hover:text-wine"

    >

      {copied ? "Copied" : label}

    </button>

  );

}



function DetailRow({

  label,

  value,

  copyValue,

}: {

  label: string;

  value: string;

  copyValue?: string;

}) {

  return (

    <div className="rounded-sm border border-ivory-warm bg-ivory/60 p-4">

      <p className="text-xs uppercase tracking-wide text-ink-light">{label}</p>

      <div className="mt-2 flex items-start justify-between gap-3">

        <p className="font-display text-lg font-light text-ink">{value}</p>

        <CopyButton value={copyValue ?? value} label="Copy" />

      </div>

    </div>

  );

}



export function BankPayView({ giftName, guestName, details }: BankPayViewProps) {

  return (

    <div className="animate-modal-in w-full max-w-lg overflow-hidden rounded-card-lg bg-white shadow-modal">

      <div className="bg-gradient-to-br from-wine to-wine-dark px-8 py-10 text-center text-ivory">

        <p className="text-xs uppercase tracking-editorial text-gold-light">Bank Transfer</p>

        <h1 className="mt-3 font-display text-3xl font-light">{giftName}</h1>

        <p className="mt-2 font-display text-2xl font-light text-gold-light">

          €{details.amount.toFixed(2)} EUR

        </p>

        <p className="mt-4 text-sm font-light text-ivory/80">From {guestName}</p>

      </div>



      <div className="space-y-4 p-8">

        <p className="text-center text-sm leading-relaxed text-ink-muted">

          Copy these details into your bank app to send the transfer. After sending, return to the

          registry and confirm your payment.

        </p>



        <DetailRow label="Account name" value={details.accountName} />

        <DetailRow label="IBAN" value={details.ibanDisplay} copyValue={details.iban} />

        <DetailRow label="BIC / SWIFT" value={details.bic} />

        <DetailRow

          label="Amount"

          value={`€${details.amount.toFixed(2)} EUR`}

          copyValue={details.amount.toFixed(2)}

        />

        <DetailRow label="Reference" value={details.reference} />

      </div>

    </div>

  );

}


