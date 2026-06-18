 "use client";

import { useState } from "react";

const foods = ["삼겹살", "소고기", "닭고기", "생선", "새우", "만두", "명란", "기타"];
const weights = [200, 300, 500, 700, 1000];

const thawHours: Record<string, Record<number, number>> = {
  삼겹살: { 200: 4, 300: 5, 500: 8, 700: 10, 1000: 12 },
  소고기: { 200: 4, 300: 6, 500: 8, 700: 11, 1000: 14 },
  닭고기: { 200: 5, 300: 7, 500: 10, 700: 13, 1000: 16 },
  생선: { 200: 3, 300: 4, 500: 6, 700: 8, 1000: 10 },
  새우: { 200: 2, 300: 3, 500: 4, 700: 5, 1000: 7 },
  명란: { 200: 1, 300: 1, 500: 2, 700: 3, 1000: 4 },
  만두: { 200: 0, 300: 0, 500: 0, 700: 0, 1000: 0 },
  기타: { 200: 4, 300: 5, 500: 8, 700: 10, 1000: 12 },
};

function getNearestWeight(weight: number) {
  return weights.reduce((prev, curr) =>
    Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateLabel(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "오늘";
  if (date.toDateString() === tomorrow.toDateString()) return "내일";

  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

export default function Home() {
  const [food, setFood] = useState("삼겹살");
  const [weight, setWeight] = useState(500);
  const [customWeight, setCustomWeight] = useState("500");
  const [isCustom, setIsCustom] = useState(false);
  const [mealTime, setMealTime] = useState("19:00");

  const [result, setResult] = useState("");
  const [thawTime, setThawTime] = useState(0);
  const [startTimeText, setStartTimeText] = useState("");
  const [mealTimeText, setMealTimeText] = useState("");
  const [isLate, setIsLate] = useState(false);

  const calculate = () => {
    const inputWeight = Number(customWeight);

    if (!inputWeight || inputWeight <= 0) {
      setResult("무게를 올바르게 입력해주세요.");
      setThawTime(0);
      setStartTimeText("");
      setMealTimeText("");
      setIsLate(false);
      return;
    }

    const nearestWeight = getNearestWeight(inputWeight);
    const baseHours = thawHours[food][nearestWeight];

    const now = new Date();
    const [hour, minute] = mealTime.split(":").map(Number);
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);

    if (target.getTime() < now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const mealLabel = `${getDateLabel(target)} ${formatTime(target)}`;
    setMealTimeText(mealLabel);

    if (baseHours === 0) {
      setResult(`${food}은 바로 조리 가능해요.`);
      setThawTime(0);
      setStartTimeText("바로 조리");
      setIsLate(false);
      return;
    }

    const weightRatio = inputWeight / nearestWeight;
    const hours = Math.max(1, Math.round(baseHours * weightRatio));

    const thawStart = new Date(target.getTime() - hours * 60 * 60 * 1000);
    const diffMs = thawStart.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    const startLabel = `${getDateLabel(thawStart)} ${formatTime(thawStart)}`;
    setStartTimeText(startLabel);
    setThawTime(hours);

    if (diffHours <= 0) {
      setResult("지금 바로 꺼내세요");
      setIsLate(true);
    } else if (diffHours <= 6) {
      setResult(`${diffHours}시간 후 꺼내세요`);
      setIsLate(false);
    } else {
      setResult(`${startLabel}에 꺼내세요`);
      setIsLate(false);
    }
  };

  return (
    <main className="min-h-screen bg-orange-50 px-5 py-8 text-gray-900">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <div className="mb-3 text-4xl">❄️⏰</div>
          <h1 className="text-4xl font-bold">
            지금<span className="text-orange-500">꺼내</span>
          </h1>
          <p className="mt-3 text-gray-600">
            먹는 시간에 맞춰 가장 좋은 해동 타이밍을 알려드려요
          </p>
        </header>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold">1. 무엇을 드시나요?</h2>

          <div className="grid grid-cols-2 gap-3">
            {foods.map((item) => (
              <button
                key={item}
                onClick={() => setFood(item)}
                className={`rounded-2xl border p-4 font-semibold ${
                  food === item
                    ? "border-orange-500 bg-orange-100 text-orange-600"
                    : "border-gray-200 bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <h2 className="mb-3 mt-6 font-bold">2. 얼마나 있나요?</h2>

          <div className="grid grid-cols-3 gap-3">
            {weights.map((w) => (
              <button
                key={w}
                onClick={() => {
                  setWeight(w);
                  setCustomWeight(String(w));
                  setIsCustom(false);
                }}
                className={`rounded-xl border py-3 font-semibold ${
                  weight === w && !isCustom
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {w === 1000 ? "1kg" : `${w}g`}
              </button>
            ))}

            <button
              onClick={() => setIsCustom(true)}
              className={`rounded-xl border py-3 font-semibold ${
                isCustom
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-200 bg-white"
              }`}
            >
              직접입력
            </button>
          </div>

          {isCustom && (
            <input
              type="number"
              value={customWeight}
              onChange={(e) => {
                setCustomWeight(e.target.value);
                setWeight(Number(e.target.value));
              }}
              placeholder="예: 450"
              className="mt-3 w-full rounded-xl border border-gray-200 p-4 text-lg"
            />
          )}

          <h2 className="mb-3 mt-6 font-bold">3. 언제 드실 건가요?</h2>

          <input
            type="time"
            value={mealTime}
            onChange={(e) => setMealTime(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-4 text-lg"
          />

          <button
            onClick={calculate}
            className="mt-6 w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-md"
          >
            언제 꺼낼까?
          </button>
        </section>

        {result && (
          <section className="mt-5 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {food} · {customWeight}g
              </p>

              <p className="mt-4 text-sm text-gray-500">추천 알림</p>

              <h2 className="mt-2 text-3xl font-bold text-orange-500">
                {result}
              </h2>

              {isLate && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-500">
                  이미 권장 해동 시작 시간이 지났어요. 가능하면 지금 바로 냉장 해동하세요.
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-orange-50 p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">식사 예정 시간</span>
                <span className="font-bold">{mealTimeText}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">꺼내야 할 시간</span>
                <span className="font-bold">{startTimeText}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">예상 해동시간</span>
                <span className="font-bold">
                  {thawTime === 0 ? "없음" : `${thawTime}시간`}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <p className="mb-2 font-semibold">💡 해동 팁</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 냉장 해동을 권장합니다.</li>
                <li>• 실온 장시간 방치는 피하세요.</li>
                <li>• 조리 30분 전 꺼내면 식감이 좋아집니다.</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}