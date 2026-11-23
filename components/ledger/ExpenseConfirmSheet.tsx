"use client";

import { Sheet } from "@/components/ds/Sheet";

import type { ExpenseConfirmSheetProps } from "./expense-confirm-types";
import { ExpenseConfirmDuplicateBanner } from "./ExpenseConfirmDuplicateBanner";
import { ExpenseConfirmFooter } from "./ExpenseConfirmFooter";
import { ExpenseConfirmFormBody } from "./ExpenseConfirmFormBody";
import { ExpenseConfirmWarnings } from "./ExpenseConfirmWarnings";
import { useExpenseConfirmSheet } from "./useExpenseConfirmSheet";

export function ExpenseConfirmSheet(props: ExpenseConfirmSheetProps) {
  const {
    draft,
    title,
    merchant,
    setMerchant,
    merchantKo,
    setMerchantKo,
    amount,
    setAmount,
    currency,
    setCurrency,
    spentOn,
    setSpentOn,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    payerId,
    setPayerId,
    participants,
    toggleParticipant,
    cardProfileId,
    setCardProfileId,
    currencyOptions,
    fxRate,
    setFxRate,
    fxMeta,
    fxLoadFailed,
    manualFxDraft,
    handleManualFxInput,
    feeUnset,
    saving,
    error,
    dupes,
    ignoreDupes,
    setIgnoreDupes,
    breakdown,
    canSave,
    handleSave,
    members,
    cardProfiles,
  } = useExpenseConfirmSheet(props);

  if (!draft) return null;

  return (
    <Sheet
      open
      onClose={props.onClose}
      title={title}
      footer={
        <ExpenseConfirmFooter
          canSave={canSave}
          saving={saving}
          onSave={() => void handleSave()}
        />
      }
    >
      {dupes.length > 0 && !ignoreDupes ? (
        <ExpenseConfirmDuplicateBanner
          dupes={dupes}
          onClose={props.onClose}
          onIgnore={() => setIgnoreDupes(true)}
        />
      ) : null}

      <ExpenseConfirmWarnings
        draft={draft}
        feeUnset={feeUnset}
        paymentMethod={paymentMethod}
      />

      <ExpenseConfirmFormBody
        merchant={merchant}
        onMerchantChange={setMerchant}
        merchantKo={merchantKo}
        onMerchantKoChange={setMerchantKo}
        amount={amount}
        onAmountChange={setAmount}
        currency={currency}
        onCurrencyChange={setCurrency}
        currencyOptions={currencyOptions}
        spentOn={spentOn}
        onSpentOnChange={setSpentOn}
        category={category}
        onCategoryChange={setCategory}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cardProfiles={cardProfiles}
        cardProfileId={cardProfileId}
        onCardProfileIdChange={setCardProfileId}
        payerId={payerId}
        onPayerIdChange={setPayerId}
        members={members}
        participants={participants}
        onToggleParticipant={toggleParticipant}
        breakdown={breakdown}
        fxRate={fxRate}
        fxMeta={fxMeta}
        fxLoadFailed={fxLoadFailed}
        manualFxDraft={manualFxDraft}
        onFxRateChange={(n) => setFxRate(n)}
        onManualFxInput={handleManualFxInput}
      />

      {error ? (
        <p className="mt-2 text-xs font-semibold text-mu-err">{error}</p>
      ) : null}
    </Sheet>
  );
}
