type Props = {
  audience: "host" | "guest";
};

/** journey 모드 송금 단계 제목. */
export function PayStepHeader({ audience }: Props) {
  return (
    <div>
      <h2 className="text-mu-title text-mu-fg">송금을 챙겨요</h2>
      <p className="mt-1 text-mu-body text-mu-fg-2">
        {audience === "guest"
          ? "내 송금만 보여요. 앱에서 보낸 뒤 ‘송금 완료’를 눌러 주세요."
          : "앱에서 직접 송금한 뒤, 여기서 완료를 눌러 주세요."}
      </p>
    </div>
  );
}
