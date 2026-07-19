'use client';
import TravelTextResultCard from './TravelTextResultCard';
import Image from 'next/image';

import { useEffect, useState } from 'react';
import { test } from '@/data/test';

type Answer = (typeof test)[number]['answers'][number];

const DRUMROLL_DURATION = 3000;
const FADE_DURATION = 200;

export default function TravelTestCard() {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [answers, setAnswers] = useState<(Answer | null)[]>(
    Array(test.length).fill(null),
  );
  const [showResult, setShowResult] = useState(false);
  const [visible, setVisible] = useState(false);

  const isFinished = currentNumber > test.length;

  useEffect(() => {
    if (!isFinished) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [isFinished]);

  useEffect(() => {
    if (!isFinished || showResult) return;
    const timeoutId = setTimeout(() => setVisible(false), DRUMROLL_DURATION);
    return () => clearTimeout(timeoutId);
  }, [isFinished, showResult]);

  useEffect(() => {
    if (!isFinished || showResult || visible) return;
    const timeoutId = setTimeout(() => {
      setShowResult(true);
      setVisible(true);
    }, FADE_DURATION);
    return () => clearTimeout(timeoutId);
  }, [isFinished, showResult, visible]);

  const handleSelect = (answer: Answer) => {
    const nextAnswers = [...answers];
    nextAnswers[currentNumber - 1] = answer;
    setAnswers(nextAnswers);
  };

  const handlePrev = () => {
    if (currentNumber === 1) return;
    setCurrentNumber((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!answers[currentNumber - 1]) return;
    setCurrentNumber((prev) => prev + 1);
  };

  if (isFinished) {
    const totalCapi = answers.reduce((sum, a) => sum + (a?.capi ?? 0), 0);
    const totalBara = answers.reduce((sum, a) => sum + (a?.bara ?? 0), 0);
    const result = totalCapi >= totalBara ? 'capi' : 'bara';

    return (
      <div
        className={`transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {showResult ? (
          <TravelTextResultCard
            result={result}
            totalCapi={totalCapi}
            totalBara={totalBara}
          />
        ) : (
          <div className='flex flex-col gap-5 items-center'>
            <div className='flex gap-4 items-center'>
              <Image
                src='/images/capi2.webp'
                alt='Travel Test Image'
                width={120}
                height={175}
                loading='eager'
              />
              <Image
                src='/images/bara2.webp'
                alt='Travel Test Image'
                width={120}
                height={175}
                loading='eager'
              />
            </div>
            <div className='font-jalnan text-2xl text-center text-brown'>
              <span className='text-brown-light'>이주현</span>님의 결과는
              두구두구두구두구~
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentQuestion = test[currentNumber - 1];
  const currentAnswer = answers[currentNumber - 1];
  const isLastQuestion = currentNumber === test.length;

  return (
    <div className='w-full flex flex-col gap-7.5'>
      <div className='flex gap-1.5 mx-auto w-fit'>
        {test.map((t) => (
          <div
            key={t.number}
            className={`w-2 h-2 rounded-full ${
              t.number === currentNumber
                ? 'bg-[#8BB17F]'
                : t.number < currentNumber
                  ? 'bg-primary'
                  : 'bg-border'
            }`}
          ></div>
        ))}
      </div>
      <div className='font-jalnan text-[20px] text-center text-brown-light'>
        {currentQuestion.question}
      </div>
      <div className='flex flex-col gap-2.5 w-full'>
        {currentQuestion.answers.map((a) => (
          <div
            key={a.answer}
            onClick={() => handleSelect(a)}
            className='w-full flex gap-2.5 items-center border border-border has-checked:border-primary has-checked:bg-primary-light rounded-[10px] px-2.5 py-3 transition-colors cursor-pointer'
          >
            <input
              type='radio'
              name={`question-${currentQuestion.number}`}
              checked={currentAnswer?.answer === a.answer}
              onChange={() => handleSelect(a)}
              className='peer appearance-none w-5 h-5 shrink-0 rounded-full border border-border checked:border-primary bg-clip-content p-0.75 checked:bg-primary transition-colors cursor-pointer'
            />
            <label className='text-main peer-checked:font-medium peer-checked:text-primary'>
              {a.answer}
            </label>
          </div>
        ))}
      </div>
      <div className='flex gap-72'>
        {currentNumber > 1 && (
          <button
            onClick={handlePrev}
            className='bg-white text-primary border border-primary rounded-full px-8 py-3 w-full'
          >
            이전
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!currentAnswer}
          className='bg-primary text-white rounded-full px-8 py-3 disabled:opacity-40 w-full'
        >
          {isLastQuestion ? '결과 보기' : '다음'}
        </button>
      </div>
    </div>
  );
}
