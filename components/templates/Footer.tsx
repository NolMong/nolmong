import React from 'react';

export default function Footer() {
  return (
    <div className='w-full px-10 py-10 flex flex-col leading-[1.7] justify-center text-xs text-sub bg-white border-t border-border'>
      <span className='font-jalnan mb-2 text-[16px] text-brown-light'>
        여유롭고 몽글하게 여행갈래{' '}
        <span className='text-caramel'>
          <span className='text-primary'>Nol</span>Mong
        </span>
      </span>
      <span>Made by 김혜진 · 이규태 · 이주현</span>
      <span>
        <span>Github</span> https://github.com/NolMong/nolmong
      </span>
      <br />© 2026 NOLMONG. All rights reserved.
    </div>
  );
}
