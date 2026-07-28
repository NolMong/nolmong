import React from 'react';

export default function Nothing({
  text,
  width,
  height,
  textSize = 'text-sm',
}: {
  text: string;
  width?: string;
  height?: string;
  textSize?: string;
}) {
  return (
    <div
      className={`flex justify-center items-center text-muted ${textSize}`}
      style={{ width: width || '100%', height: height || '100%' }}
    >
      {text || '장소가 없습니다.'}
    </div>
  );
}
